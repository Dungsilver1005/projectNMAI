import json
import sys
import warnings
from datetime import datetime
from pathlib import Path

warnings.filterwarnings("ignore")

import joblib
import numpy as np
from scipy.sparse import csr_matrix, hstack


BASE_DIR = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = BASE_DIR / "model_artifacts"
MODEL_PATH = ARTIFACT_DIR / "xgb_fraud_model_combined.joblib"
VECTORIZER_PATH = ARTIFACT_DIR / "tfidf_vectorizer.joblib"
SCALER_PATH = ARTIFACT_DIR / "robust_scaler.joblib"
TABULAR_COLUMNS_PATH = ARTIFACT_DIR / "tabular_columns.joblib"
V_FEATURE_MEANS_PATH = ARTIFACT_DIR / "v_feature_means.joblib"

MODEL = None
VECTORIZER = None
SCALER = None
TABULAR_COLUMNS = None
V_FEATURE_MEANS = None


def load_artifacts():
    global MODEL, VECTORIZER, SCALER, TABULAR_COLUMNS, V_FEATURE_MEANS

    if MODEL is None:
        MODEL = joblib.load(MODEL_PATH)
    if VECTORIZER is None:
        VECTORIZER = joblib.load(VECTORIZER_PATH)
    if SCALER is None:
        SCALER = joblib.load(SCALER_PATH)
    if TABULAR_COLUMNS is None:
        TABULAR_COLUMNS = list(joblib.load(TABULAR_COLUMNS_PATH))
    if V_FEATURE_MEANS is None:
        V_FEATURE_MEANS = joblib.load(V_FEATURE_MEANS_PATH)

    return MODEL, VECTORIZER, SCALER, TABULAR_COLUMNS, V_FEATURE_MEANS


def parse_timestamp(value):
    if not value:
        return datetime.utcnow()

    if isinstance(value, (int, float)):
        if value > 1e10:
            value = value / 1000.0
        return datetime.utcfromtimestamp(value)

    normalized = str(value).replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        return datetime.utcnow()


def get_amount_and_time(input_data):
    amount = float(input_data.get("amount") or input_data.get("Amount") or 0)
    timestamp = parse_timestamp(input_data.get("timestamp") or input_data.get("Timestamp"))
    time_value = float(input_data.get("time") or input_data.get("Time") or timestamp.timestamp())

    return amount, time_value


def scale_amount_and_time(input_data, scaler):
    amount, time_value = get_amount_and_time(input_data)
    raw_by_name = {
        "Amount": amount,
        "amount": amount,
        "Time": time_value,
        "time": time_value,
    }

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
        return {
            "scaled_amount": float(scaled_values[0]),
            "scaled_time": float(scaled_values[1]),
        }

    scaled_value = float(scaler.transform(np.array([[amount]], dtype=float))[0][0])
    return {
        "scaled_amount": scaled_value,
        "scaled_time": time_value,
    }


def build_tabular_features(input_data, scaler, tabular_columns, v_feature_means):
    scaled_features = scale_amount_and_time(input_data, scaler)
    row = {
        "scaled_amount": scaled_features["scaled_amount"],
        "scaled_time": scaled_features["scaled_time"],
    }

    for column in tabular_columns:
        if column.startswith("V"):
            row[column] = float(input_data.get(column, v_feature_means.get(column, 0)))

    values = [row.get(column, float(input_data.get(column, 0))) for column in tabular_columns]
    return np.array([values], dtype=float)


def get_content(input_data):
    return (
        input_data.get("Transaction_Content")
        or input_data.get("content")
        or input_data.get("processed_content")
        or ""
    )


def class_to_label(value):
    if isinstance(value, str):
        normalized = value.lower()
        return "fraud" if normalized in {"fraud", "1", "true"} else "normal"

    return "fraud" if int(value) == 1 else "normal"


def predict(input_data):
    model, vectorizer, scaler, tabular_columns, v_feature_means = load_artifacts()

    text_features = vectorizer.transform([str(get_content(input_data)).lower()])
    tabular_features = build_tabular_features(input_data, scaler, tabular_columns, v_feature_means)
    combined_features = hstack([text_features, csr_matrix(tabular_features)])

    predicted_class = model.predict(combined_features)[0]
    prediction = class_to_label(predicted_class)

    result = {"prediction": prediction}
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(combined_features)[0]
        class_index = list(getattr(model, "classes_", [0, 1])).index(predicted_class)
        result["probability"] = round(float(probabilities[class_index]), 4)

    return result


if __name__ == "__main__":
    try:
        input_json = sys.stdin.read()
        if not input_json:
            raise ValueError("No input received")

        print(json.dumps(predict(json.loads(input_json))))
    except Exception as exc:
        print(json.dumps({"prediction": "normal", "error": str(exc)}))
        sys.exit(1)
