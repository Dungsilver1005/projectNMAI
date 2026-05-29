const logger = require('../utils/logger');
const http = require('http');
const https = require('https');

/**
 * Calls the dedicated AI inference microservice.
 */
const requestJson = (method, pathname, body = null) => {
    return new Promise((resolve, reject) => {
        const baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const timeoutMs = parseInt(process.env.AI_SERVICE_TIMEOUT_MS, 10) || 8000;
        const targetUrl = new URL(pathname, baseUrl);
        const payload = body ? JSON.stringify(body) : null;
        const transport = targetUrl.protocol === 'https:' ? https : http;

        const req = transport.request(targetUrl, {
            method,
            headers: {
                Accept: 'application/json',
                ...(payload ? {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                } : {})
            }
        }, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk.toString();
            });

            res.on('end', () => {
                try {
                    const parsed = responseData ? JSON.parse(responseData) : {};
                    if (res.statusCode >= 400) {
                        reject(new Error(parsed.detail || parsed.message || `AI service returned ${res.statusCode}`));
                        return;
                    }
                    resolve(parsed);
                } catch (error) {
                    reject(new Error(`Invalid AI service response: ${responseData}`));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error(`AI service timeout after ${timeoutMs}ms`));
        });

        if (payload) {
            req.write(payload);
        }
        req.end();
    });
};

const predictModel = async (features) => {
    const response = await requestJson('POST', '/predict', features);
    const result = response.data || response;

    logger.info(`AI prediction completed: ${result.prediction || 'unknown'}`);
    return result;
};

const getAiServiceHealth = async () => {
    try {
        const response = await requestJson('GET', '/health');
        return {
            online: true,
            ...response
        };
    } catch (error) {
        return {
            online: false,
            message: error.message
        };
    }
};

module.exports = {
    predictModel,
    getAiServiceHealth
};
