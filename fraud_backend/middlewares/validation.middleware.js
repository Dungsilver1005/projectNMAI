const Joi = require('joi');

const transactionSchema = Joi.object({
    account_id: Joi.string().trim().max(64).allow('', null).optional(),
    card_id: Joi.string().trim().max(64).allow('', null).optional(),
    customer_name: Joi.string().trim().max(120).allow('', null).optional(),
    amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be greater than 0',
        'any.required': 'Amount is required'
    }),
    timestamp: Joi.date().iso().required().messages({
        'date.base': 'Timestamp must be a valid date',
        'date.format': 'Timestamp must be in ISO format',
        'any.required': 'Timestamp is required'
    }),
    content: Joi.string().allow('', null).optional(),
    merchant: Joi.string().trim().max(120).allow('', null).optional(),
    channel: Joi.string().valid('mobile', 'internet_banking', 'atm', 'pos', 'counter', 'api').allow('', null).optional(),
    location: Joi.string().trim().max(120).allow('', null).optional(),
    currency: Joi.string().trim().uppercase().length(3).default('VND').optional()
});

const validateTransaction = (req, res, next) => {
    const { error, value } = transactionSchema.validate(req.body, {
        stripUnknown: true,
        convert: true
    });
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    req.body = value;
    next();
};

module.exports = {
    validateTransaction
};
