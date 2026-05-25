const Joi = require('joi');

const transactionSchema = Joi.object({
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
    content: Joi.string().allow('', null).optional()
});

const validateTransaction = (req, res, next) => {
    const { error } = transactionSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    
    next();
};

module.exports = {
    validateTransaction
};
