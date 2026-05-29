const mongoose = require('mongoose');
const { getAiServiceHealth } = require('../services/predictModel.service');

const getHealth = async (req, res) => {
    const ai = await getAiServiceHealth();

    res.status(200).json({
        success: true,
        data: {
            backend: {
                online: true,
                uptime_seconds: Math.round(process.uptime()),
                environment: process.env.NODE_ENV || 'development'
            },
            database: {
                online: mongoose.connection.readyState === 1,
                state: mongoose.connection.readyState
            },
            ai
        }
    });
};

module.exports = {
    getHealth
};
