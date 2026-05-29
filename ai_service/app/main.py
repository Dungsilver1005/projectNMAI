import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from scipy.sparse import csr_matrix, hstack


DEFAULT_ARTIFACT_DIR = Path(__file__).resolve().parents[2] / "fraud_backend" / "model_artifacts"
ARTIFACT_DIR = Path(os.getenv("MODEL_ARTIFACT_DIR", str(DEFAULT_ARTIFACT_DIR)))
MODEL_PATH = ARTIFACT_DIR / "xgb_fraud_model_combined.joblib"
VECTORIZER_PATH = ARTIFACT_DIR / "tfidf_vectorizer.joblib"
SCALER_PATH = ARTIFACT_DIR / "robust_scaler.joblib"
TABULAR_COLUMNS_PATH = ARTIFACT_DIR / "tabular_columns.joblib"
V_FEATURE_MEANS_PATH = ARTIFACT_DIR / "v_feature_means.joblib"


class TransactionFeatures(BaseModel):
    model_config = ConfigDict(extra="allow")

    amount: float = Field(default=0)
    timestamp: Optional[Any] = None
    time: Optional[float] = None
    Transaction_Content: Optional[str] = ""
    content: Optional[str] = ""


class ModelBundle:
    def __init__(self) -> None:
        self.model = None
        self.vectorizer = None
        self.scaler = None
        self.tabular_columns = None
        self.v_feature_means = None
        self.loaded_at = None

    def load(self) -> None:
        self.model = joblib.load(MODEL_PATH)
        self.vectorizer = joblib.load(VECTORIZER_PATH)
        self.scaler = joblib.load(SCALER_PATH)
        self.tabular_columns = list(joblib.load(TABULAR_COLUMNS_PATH))
        self.v_feature_means = joblib.load(V_FEATURE_MEANS_PATH)
        self.loaded_at = datetime.now(timezone.utc)

    @property
    def is_loaded(self) -> bool:
        return all(
            [
                self.model is not None,
                self.vectorizer is not None,
                self.scaler is not None,
                self.tabular_columns is not None,
                self.v_feature_means is not None,
            ]
        )


bundle = ModelBundle()


def parse_timestamp(value: Any) -> datetime:
    if not value:
        return datetime.now(timezone.utc)

    if isinstance(value, (int, float)):
        seconds = value / 1000.0 if value > 1e10 else value
        return datetime.fromtimestamp(seconds, tz=timezone.utc)

    normalized = str(value).replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(normalized)
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except ValueError:
        return datetime.now(timezone.utc)


def amount_and_time(input_data: Dict[str, Any]) -> tuple[float, float]:
    amount = float(input_data.get("amount") or input_data.get("Amount") or 0)
    timestamp = parse_timestamp(input_data.get("timestamp") or input_data.get("Timestamp"))
    time_value = float(input_data.get("time") or input_data.get("Time") or timestamp.timestamp())
    return amount, time_value


def scale_amount_and_time(input_data: Dict[str, Any]) -> Dict[str, float]:
    amount, time_value = amount_and_time(input_data)
    raw_by_name = {
        "Amount": amount,
        "amount": amount,
        "Time": time_value,
        "time": time_value,
    }

    scaler = bundle.scaler
    if hasattr(scaler, "feature_names_in_"):
        raw_values = [raw_by_name.get(name, input_data.get(name, 0)) for name in scaler.feature_names_in_]
        scaled_values = scaler.transform(np.array([raw_values], dtype=float))[0]
        scaled_by_name = dict(zip(scaler.feature_names_in_, scaled_values))
        return {
            "scaled_amount": float(scaled_by_name.get("Amount", scaled_by_name.get("amount", scaled_values[0]))),
            "scaled_time": float(scaled_by_name.get("Time", scaled_by_name.get("time", scaled_values[-1]))),
        }

    feature_count = int(getattr(scaler, "n_features_in_", 2))
    if feature_count >= 2:
        scaled_values = scaler.transform(np.array([[amount, time_value]], dtype=float))[0]
        return {"scaled_amount": float(scaled_values[0]), "scaled_time": float(scaled_values[1])}

    scaled_value = float(scaler.transform(np.array([[amount]], dtype=float))[0][0])
    return {"scaled_amount": scaled_value, "scaled_time": time_value}


def build_tabular_features(input_data: Dict[str, Any]) -> np.ndarray:
    scaled_features = scale_amount_and_time(input_data)
    row = {
        "scaled_amount": scaled_features["scaled_amount"],
        "scaled_time": scaled_features["scaled_time"],
    }

    for column in bundle.tabular_columns:
        if column.startswith("V"):
            row[column] = float(input_data.get(column, bundle.v_feature_means.get(column, 0)))

    values = [row.get(column, float(input_data.get(column, 0))) for column in bundle.tabular_columns]
    return np.array([values], dtype=float)


def get_content(input_data: Dict[str, Any]) -> str:
    return (
        input_data.get("Transaction_Content")
        or input_data.get("content")
        or input_data.get("processed_content")
        or ""
    )


def class_to_label(value: Any) -> str:
    if isinstance(value, str):
        return "fraud" if value.lower() in {"fraud", "1", "true"} else "normal"

    return "fraud" if int(value) == 1 else "normal"


def fraud_probability(probabilities: np.ndarray, classes: Any) -> float:
    class_list = list(classes) if classes is not None else [0, 1]
    fraud_labels = {"fraud", "1", "true"}

    for index, label in enumerate(class_list):
        if (isinstance(label, str) and label.lower() in fraud_labels) or label == 1:
            return round(float(probabilities[index]), 4)

    return round(float(probabilities[-1]), 4)


def run_prediction(input_data: Dict[str, Any]) -> Dict[str, Any]:
    if not bundle.is_loaded:
        raise RuntimeError("Model artifacts are not loaded")

    text_features = bundle.vectorizer.transform([get_content(input_data).lower()])
    tabular_features = build_tabular_features(input_data)
    combined_features = hstack([text_features, csr_matrix(tabular_features)])

    predicted_class = bundle.model.predict(combined_features)[0]
    prediction = class_to_label(predicted_class)
    result = {
        "prediction": prediction,
        "model": "xgb_fraud_model_combined",
        "artifact_dir": str(ARTIFACT_DIR),
    }

    if hasattr(bundle.model, "predict_proba"):
        probabilities = bundle.model.predict_proba(combined_features)[0]
        classes = getattr(bundle.model, "classes_", [0, 1])
        class_list = list(classes)
        predicted_index = class_list.index(predicted_class)
        result["confidence"] = round(float(probabilities[predicted_index]), 4)
        result["fraud_probability"] = fraud_probability(probabilities, classes)

    return result


@asynccontextmanager
async def lifespan(_: FastAPI):
    bundle.load()
    yield


app = FastAPI(title="Fraud AI Inference Service", version="1.0.0", lifespan=lifespan)


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "success": True,
        "service": "fraud-ai-service",
        "model_loaded": bundle.is_loaded,
        "loaded_at": bundle.loaded_at.isoformat() if bundle.loaded_at else None,
        "artifact_dir": str(ARTIFACT_DIR),
    }


@app.post("/predict")
def predict(features: TransactionFeatures) -> Dict[str, Any]:
    try:
        payload = features.model_dump() if hasattr(features, "model_dump") else features.dict()
        result = run_prediction(payload)
        return {"success": True, "data": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
