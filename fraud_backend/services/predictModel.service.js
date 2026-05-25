const { spawn } = require('child_process');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Calls the Python script to run AI prediction
 */
const predictModel = (features) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../python/predict.py');
        const inputData = JSON.stringify(features);
        
        let outputData = '';
        let errorData = '';

        const pythonBin = process.env.PYTHON_BIN || 'python';
        const pythonProcess = spawn(pythonBin, [scriptPath]);

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                logger.error(`Python script exited with code ${code}. Error: ${errorData || outputData}`);
                // Resolve with normal to not break the whole flow, acting as fallback
                resolve({ prediction: "normal" });
            } else {
                try {
                    const result = JSON.parse(outputData);
                    resolve(result);
                } catch (e) {
                    logger.error(`Failed to parse python script output: ${outputData}`);
                    resolve({ prediction: "normal" });
                }
            }
        });

        // Send data to python script via stdin
        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();
    });
};

module.exports = {
    predictModel
};
