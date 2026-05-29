const FraudEvent = require('../models/fraudEvent.model');

const getFraudEvents = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const eventType = req.query.event_type;
        const severity = req.query.severity;

        const filter = {
            ...(eventType ? { event_type: eventType } : {}),
            ...(severity ? { severity } : {})
        };

        const events = await FraudEvent.find(filter)
            .populate('transaction')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await FraudEvent.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: events,
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

module.exports = {
    getFraudEvents
};
