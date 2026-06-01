const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/error.middleware');
const transactionRoutes = require('./routes/transaction.routes');
const healthRoutes = require('./routes/health.routes');
const fraudEventRoutes = require('./routes/fraudEvent.routes');
const {
    dashboardReadLimiter,
    healthLimiter
} = require('./middlewares/rateLimit.middleware');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthLimiter, healthRoutes);
app.use('/api/transactions', dashboardReadLimiter, transactionRoutes);
app.use('/api/fraud-events', dashboardReadLimiter, fraudEventRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
