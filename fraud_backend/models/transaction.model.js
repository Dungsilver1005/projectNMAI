const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    account_id: {
        type: String,
        default: ""
    },
    card_id: {
        type: String,
        default: ""
    },
    customer_name: {
        type: String,
        default: ""
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "VND"
    },
    timestamp: {
        type: Date,
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    merchant: {
        type: String,
        default: ""
    },
    channel: {
        type: String,
        enum: ['mobile', 'internet_banking', 'atm', 'pos', 'counter', 'api', ''],
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    rule_based_result: {
        type: String,
        enum: ['fraud', 'normal'],
        required: true
    },
    ai_result: {
        type: String,
        enum: ['fraud', 'normal'],
        required: true
    },
    final_result: {
        type: String,
        enum: ['fraud', 'normal'],
        required: true
    },
    ai_probability: {
        type: Number,
        default: 0
    },
    ai_confidence: {
        type: Number,
        default: null
    },
    risk_score: {
        type: Number,
        default: 0
    },
    risk_level: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    ai_service_status: {
        type: String,
        enum: ['online', 'fallback'],
        default: 'online'
    },
    decision_notes: {
        type: [String],
        default: []
    },
    transaction_status: {
        type: String,
        enum: ['approved', 'review', 'blocked'],
        default: 'approved'
    },
    account_status: {
        type: String,
        enum: ['active', 'watchlist', 'locked'],
        default: 'active'
    },
    card_status: {
        type: String,
        enum: ['active', 'watchlist', 'blocked'],
        default: 'active'
    },
    enforcement_actions: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
