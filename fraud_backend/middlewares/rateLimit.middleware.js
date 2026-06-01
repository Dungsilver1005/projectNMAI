const rateLimit = require('express-rate-limit');

const minutes = (value) => value * 60 * 1000;

const parseLimit = (name, fallback) => {
    const value = parseInt(process.env[name], 10);
    return Number.isNaN(value) ? fallback : value;
};

const createJsonLimiter = ({ windowMs, max, message, skip }) => rateLimit({
    windowMs,
    max,
    skip,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message
    }
});

const dashboardReadLimiter = createJsonLimiter({
    windowMs: minutes(parseLimit('DASHBOARD_RATE_LIMIT_WINDOW_MINUTES', 15)),
    max: parseLimit('DASHBOARD_RATE_LIMIT_MAX', 2500),
    skip: (req) => !['GET', 'HEAD', 'OPTIONS'].includes(req.method),
    message: 'Dashboard refresh limit exceeded. Please slow down polling.'
});

const healthLimiter = createJsonLimiter({
    windowMs: minutes(parseLimit('HEALTH_RATE_LIMIT_WINDOW_MINUTES', 15)),
    max: parseLimit('HEALTH_RATE_LIMIT_MAX', 3000),
    skip: (req) => !['GET', 'HEAD', 'OPTIONS'].includes(req.method),
    message: 'Health check limit exceeded. Please slow down polling.'
});

const transactionWriteLimiter = createJsonLimiter({
    windowMs: minutes(parseLimit('TRANSACTION_RATE_LIMIT_WINDOW_MINUTES', 15)),
    max: parseLimit('TRANSACTION_RATE_LIMIT_MAX', 120),
    message: 'Too many transaction checks from this client. Please try again later.'
});

module.exports = {
    dashboardReadLimiter,
    healthLimiter,
    transactionWriteLimiter
};
