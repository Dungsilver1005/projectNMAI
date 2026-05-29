const express = require('express');
const { getFraudEvents } = require('../controllers/fraudEvent.controller');

const router = express.Router();

router.get('/', getFraudEvents);

module.exports = router;
