const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { check } = require('express-validator');
const { contactLimiter } = require('../../middleware/rateLimiter');
const { subscribe, unsubscribe, getSubscribers } = require('../../controllers/newsletterController');

// @route   POST api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', contactLimiter, [
  check('email', 'Please include a valid email').isEmail()
], subscribe);

// @route   POST api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post('/unsubscribe', [
  check('email', 'Please include a valid email').isEmail()
], unsubscribe);

// @route   GET api/newsletter/subscribers
// @desc    Get all subscribers
// @access  Admin
router.get('/subscribers', adminAuth, getSubscribers);

module.exports = router;
