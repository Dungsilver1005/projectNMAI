const mongoose = require('mongoose');

const fraudEventSchema = new mongoose.Schema({
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    event_type: {
        type: String,
        enum: ['transaction_blocked', 'card_blocked', 'account_locked', 'manual_review'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
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
        default: 0
    },
    currency: {
        type: String,
        default: "VND"
    },
    risk_score: {
        type: Number,
        default: 0
    },
    reason: {
        type: String,
        required: true
    },
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FraudEvent', fraudEventSchema);
