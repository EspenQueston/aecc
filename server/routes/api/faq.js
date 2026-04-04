const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getFAQs, createFAQ, updateFAQ, deleteFAQ } = require('../../controllers/faqController');

// Public
router.get('/', getFAQs);

// Admin only
router.post('/', adminAuth, createFAQ);
router.put('/:id', adminAuth, updateFAQ);
router.delete('/:id', adminAuth, deleteFAQ);

module.exports = router;
