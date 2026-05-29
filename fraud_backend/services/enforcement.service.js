const FraudEvent = require('../models/fraudEvent.model');

const CRITICAL_LOCK_THRESHOLD = 0.9;
const REVIEW_THRESHOLD = 0.45;

const severityFromScore = (score) => {
    if (score >= CRITICAL_LOCK_THRESHOLD) return 'critical';
    if (score >= 0.75) return 'high';
    if (score >= REVIEW_THRESHOLD) return 'medium';
    return 'low';
};

const buildStatuses = (evaluation) => {
    const riskScore = evaluation.risk_score || 0;
    const actions = [];
    let transaction_status = 'approved';
    let account_status = 'active';
    let card_status = 'active';

    if (evaluation.final_result === 'fraud') {
        transaction_status = 'blocked';
        actions.push('transaction_blocked');
    } else if (riskScore >= REVIEW_THRESHOLD) {
        transaction_status = 'review';
        actions.push('manual_review');
    }

    if (riskScore >= CRITICAL_LOCK_THRESHOLD) {
        account_status = 'locked';
        card_status = 'blocked';
        actions.push('account_locked', 'card_blocked');
    } else if (riskScore >= REVIEW_THRESHOLD) {
        account_status = 'watchlist';
        card_status = 'watchlist';
    }

    return {
        transaction_status,
        account_status,
        card_status,
        enforcement_actions: [...new Set(actions)]
    };
};

const createFraudEvents = async (transaction, evaluation) => {
    const statuses = buildStatuses(evaluation);
    const severity = severityFromScore(evaluation.risk_score || 0);
    const notes = (evaluation.decision_notes || []).join(' | ') || 'Risk policy triggered';

    const eventPayloads = statuses.enforcement_actions.map((eventType) => ({
        transaction: transaction._id,
        event_type: eventType,
        severity: eventType === 'account_locked' || eventType === 'card_blocked' ? 'critical' : severity,
        account_id: transaction.account_id,
        card_id: transaction.card_id,
        customer_name: transaction.customer_name,
        amount: transaction.amount,
        currency: transaction.currency,
        risk_score: transaction.risk_score,
        reason: notes,
        metadata: {
            rule_based_result: transaction.rule_based_result,
            ai_result: transaction.ai_result,
            ai_probability: transaction.ai_probability,
            transaction_status: statuses.transaction_status,
            account_status: statuses.account_status,
            card_status: statuses.card_status
        }
    }));

    if (!eventPayloads.length) {
        return [];
    }

    return FraudEvent.insertMany(eventPayloads);
};

module.exports = {
    buildStatuses,
    createFraudEvents
};
