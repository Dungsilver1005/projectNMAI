const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    content: {
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
