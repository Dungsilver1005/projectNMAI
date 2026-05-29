const { preprocessTransaction } = require('./preprocess.service');
const { predictModel } = require('./predictModel.service');
const logger = require('../utils/logger');

const HIGH_VALUE_LIMIT = 500_000_000;
const REVIEW_VALUE_LIMIT = 100_000_000;
const FINAL_RISK_THRESHOLD = 0.75;
const SUSPICIOUS_KEYWORDS = [
    'hack',
    'scam',
    'fake',
    'otp',
    'link',
    'khoa',
    'khóa',
    'gap',
    'gấp',
    'khẩn',
    'xac minh',
    'xác minh'
];

const normalizeProbability = (aiResponse, aiResult) => {
    if (typeof aiResponse.fraud_probability === 'number') {
        return aiResponse.fraud_probability;
    }

    if (typeof aiResponse.probability === 'number') {
        return aiResult === 'fraud' ? aiResponse.probability : 1 - aiResponse.probability;
    }

    if (typeof aiResponse.confidence === 'number') {
        return aiResult === 'fraud' ? aiResponse.confidence : 1 - aiResponse.confidence;
    }

    return aiResult === 'fraud' ? 0.8 : 0.2;
};

const riskLevelFromScore = (score) => {
    if (score >= 0.75) return 'high';
    if (score >= 0.45) return 'medium';
    return 'low';
};

const assessFraud = async (transactionInput) => {
    const {
        amount,
        timestamp,
        content = "",
        merchant = "",
        channel = "",
        location = ""
    } = transactionInput;
    let rule_based_result = "normal";
    let ruleScore = 0.15;
    const decision_notes = [];

    if (amount > HIGH_VALUE_LIMIT) {
        rule_based_result = "fraud";
        ruleScore = Math.max(ruleScore, 0.95);
        decision_notes.push('Số tiền vượt ngưỡng kiểm soát 500M VND');
    } else if (amount > REVIEW_VALUE_LIMIT) {
        ruleScore = Math.max(ruleScore, 0.55);
        decision_notes.push('Số tiền lớn cần theo dõi');
    }

    const combinedText = [content, merchant, channel, location].filter(Boolean).join(' ');
    if (combinedText) {
        const lowerContent = combinedText.toLowerCase();
        const matchedKeyword = SUSPICIOUS_KEYWORDS.find((keyword) => lowerContent.includes(keyword));

        if (matchedKeyword) {
            rule_based_result = "fraud";
            ruleScore = Math.max(ruleScore, 0.9);
            decision_notes.push(`Nội dung chứa tín hiệu rủi ro: ${matchedKeyword}`);
        }
    }

    if (channel === 'atm' && amount > REVIEW_VALUE_LIMIT) {
        ruleScore = Math.max(ruleScore, 0.6);
        decision_notes.push('Rút tiền ATM giá trị lớn cần kiểm tra thêm');
    }

    const features = preprocessTransaction({
        amount,
        timestamp,
        content,
        merchant,
        channel,
        location
    });

    let ai_result = "normal";
    let ai_probability = 0.2;
    let ai_confidence = null;
    let ai_service_status = 'online';

    try {
        const aiResponse = await predictModel(features);
        ai_result = aiResponse.prediction || "normal";
        ai_probability = normalizeProbability(aiResponse, ai_result);
        ai_confidence = typeof aiResponse.confidence === 'number' ? aiResponse.confidence : null;

        if (ai_result === 'fraud') {
            decision_notes.push('Mô hình AI đánh dấu giao dịch gian lận');
        }
    } catch (error) {
        ai_service_status = 'fallback';
        logger.error(`AI Model prediction failed: ${error.message}`);
        decision_notes.push('AI service không phản hồi, backend dùng rule-based fallback');
    }

    const risk_score = Math.max(ruleScore, ai_probability);
    const final_result = (
        rule_based_result === 'fraud' ||
        ai_result === 'fraud' ||
        risk_score >= FINAL_RISK_THRESHOLD
    ) ? 'fraud' : 'normal';

    if (!decision_notes.length) {
        decision_notes.push('Không phát hiện tín hiệu bất thường đáng kể');
    }

    return {
        rule_based_result,
        ai_result,
        final_result,
        ai_probability: Number(ai_probability.toFixed(4)),
        ai_confidence,
        risk_score: Number(risk_score.toFixed(4)),
        risk_level: riskLevelFromScore(risk_score),
        ai_service_status,
        decision_notes
    };
};

module.exports = {
    assessFraud
};
