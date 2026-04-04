const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const { healthCheck, getStats } = require('../../controllers/systemController');

router.get('/health', auth, healthCheck);
router.get('/stats', adminAuth, getStats);

module.exports = router;
