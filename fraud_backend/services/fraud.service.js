const { preprocessTransaction } = require('./preprocess.service');
const { predictModel } = require('./predictModel.service');
const logger = require('../utils/logger');

const assessFraud = async (amount, timestamp, content) => {
    // 1. Rule-based detection
    let rule_based_result = "normal";
    if (amount > 500_000_000) {
        rule_based_result = "fraud";
    }
    
    if (content) {
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('hack') || lowerContent.includes('scam') || lowerContent.includes('fake')) {
            rule_based_result = "fraud";
        }
    }

    // 2. Preprocess features for AI
    const features = preprocessTransaction(amount, timestamp, content);

    // 3. AI Model prediction
    let ai_result = "normal";
    try {
        const aiResponse = await predictModel(features);
        ai_result = aiResponse.prediction || "normal";
    } catch (error) {
        logger.error(`AI Model prediction failed: ${error.message}`);
        // Fallback to normal if AI fails
    }

    // 4. Combine results: if either says fraud -> fraud
    const final_result = (rule_based_result === 'fraud' || ai_result === 'fraud') ? 'fraud' : 'normal';

    return {
        rule_based_result,
        ai_result,
        final_result
    };
};

module.exports = {
    assessFraud
};
