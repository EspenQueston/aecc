const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const { healthCheck, getStats, getTeam, upsertTeam, getPublicStats } = require('../../controllers/systemController');

router.get('/public-stats', getPublicStats);
router.get('/health', auth, healthCheck);
router.get('/stats', adminAuth, getStats);
router.get('/team', getTeam);
router.put('/team', adminAuth, upsertTeam);

module.exports = router;
