const express = require('express');
const { createTransaction, getTransactions, getStats } = require('../controllers/transaction.controller');
const { validateTransaction } = require('../middlewares/validation.middleware');
const router = express.Router();

router.post('/', validateTransaction, createTransaction);
router.get('/', getTransactions);
router.get('/stats', getStats);

module.exports = router;
