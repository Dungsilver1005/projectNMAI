const Transaction = require('../models/transaction.model');
const { assessFraud } = require('../services/fraud.service');

const createTransaction = async (req, res, next) => {
    try {
        const { amount, timestamp, content } = req.body;
        
        // Evaluate fraud
        const evaluation = await assessFraud(amount, timestamp, content);
        
        // Save to DB
        const transaction = await Transaction.create({
            amount,
            timestamp,
            content: content || "",
            rule_based_result: evaluation.rule_based_result,
            ai_result: evaluation.ai_result,
            final_result: evaluation.final_result
        });

        res.status(201).json({
            success: true,
            data: {
                transaction,
                rule_based_result: evaluation.rule_based_result,
                ai_result: evaluation.ai_result,
                final_result: evaluation.final_result
            }
        });
    } catch (error) {
        next(error);
    }
};

const getTransactions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Transaction.countDocuments();

        res.status(200).json({
            success: true,
            data: transactions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getStats = async (req, res, next) => {
    try {
        const total = await Transaction.countDocuments();
        const fraud_count = await Transaction.countDocuments({ final_result: 'fraud' });
        const normal_count = total - fraud_count;

        res.status(200).json({
            success: true,
            data: {
                total,
                fraud_count,
                normal_count
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTransaction,
    getTransactions,
    getStats
};
