const Transaction = require('../models/transaction.model');
const FraudEvent = require('../models/fraudEvent.model');
const { assessFraud } = require('../services/fraud.service');
const { buildStatuses, createFraudEvents } = require('../services/enforcement.service');

const createTransaction = async (req, res, next) => {
    try {
        const amount = req.body.amount;
        const timestamp = req.body.timestamp;
        const account_id = req.body.account_id || "";
        const card_id = req.body.card_id || "";
        const customer_name = req.body.customer_name || "";
        const currency = req.body.currency || "VND";
        const content = req.body.content || "";
        const merchant = req.body.merchant || "";
        const channel = req.body.channel || "";
        const location = req.body.location || "";
        const transactionInput = {
            account_id,
            card_id,
            customer_name,
            amount,
            currency,
            timestamp,
            content,
            merchant,
            channel,
            location
        };
        
        const evaluation = await assessFraud(transactionInput);
        const statuses = buildStatuses(evaluation);
        
        const transaction = await Transaction.create({
            account_id,
            card_id,
            customer_name,
            amount,
            currency,
            timestamp,
            content: content || "",
            merchant,
            channel,
            location,
            rule_based_result: evaluation.rule_based_result,
            ai_result: evaluation.ai_result,
            final_result: evaluation.final_result,
            ai_probability: evaluation.ai_probability,
            ai_confidence: evaluation.ai_confidence,
            risk_score: evaluation.risk_score,
            risk_level: evaluation.risk_level,
            ai_service_status: evaluation.ai_service_status,
            decision_notes: evaluation.decision_notes,
            transaction_status: statuses.transaction_status,
            account_status: statuses.account_status,
            card_status: statuses.card_status,
            enforcement_actions: statuses.enforcement_actions
        });
        const events = await createFraudEvents(transaction, evaluation);

        res.status(201).json({
            success: true,
            data: {
                transaction,
                events,
                rule_based_result: evaluation.rule_based_result,
                ai_result: evaluation.ai_result,
                final_result: evaluation.final_result,
                ai_probability: evaluation.ai_probability,
                ai_confidence: evaluation.ai_confidence,
                risk_score: evaluation.risk_score,
                risk_level: evaluation.risk_level,
                ai_service_status: evaluation.ai_service_status,
                decision_notes: evaluation.decision_notes,
                ...statuses
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
        const high_risk_count = await Transaction.countDocuments({ risk_level: 'high' });
        const medium_risk_count = await Transaction.countDocuments({ risk_level: 'medium' });
        const blocked_transactions = await Transaction.countDocuments({ transaction_status: 'blocked' });
        const locked_accounts = await FraudEvent.distinct('account_id', { event_type: 'account_locked', account_id: { $ne: "" } });
        const blocked_cards = await FraudEvent.distinct('card_id', { event_type: 'card_blocked', card_id: { $ne: "" } });
        const enforcement_count = await FraudEvent.countDocuments();
        const amountStats = await Transaction.aggregate([
            {
                $group: {
                    _id: null,
                    total_amount: { $sum: '$amount' },
                    fraud_amount: {
                        $sum: {
                            $cond: [{ $eq: ['$final_result', 'fraud'] }, '$amount', 0]
                        }
                    },
                    average_risk_score: { $avg: '$risk_score' }
                }
            }
        ]);
        const latest = await Transaction.findOne().sort({ createdAt: -1 });
        const totals = amountStats[0] || {};

        res.status(200).json({
            success: true,
            data: {
                total,
                fraud_count,
                normal_count,
                high_risk_count,
                medium_risk_count,
                blocked_transactions,
                locked_accounts_count: locked_accounts.length,
                blocked_cards_count: blocked_cards.length,
                enforcement_count,
                fraud_rate: total ? Number((fraud_count / total).toFixed(4)) : 0,
                total_amount: totals.total_amount || 0,
                fraud_amount: totals.fraud_amount || 0,
                average_risk_score: totals.average_risk_score ? Number(totals.average_risk_score.toFixed(4)) : 0,
                last_checked_at: latest ? latest.createdAt : null
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
