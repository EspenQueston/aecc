const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { check } = require('express-validator');
const { contactLimiter } = require('../../middleware/rateLimiter');
const { submitContact, getContacts, getContactById, updateContactStatus, replyToContact, deleteContact } = require('../../controllers/contactController');

// @route   POST api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', contactLimiter, [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('subject', 'Subject is required').not().isEmpty(),
  check('message', 'Message is required').not().isEmpty()
], submitContact);

// @route   GET api/contact
// @desc    Get all contact messages
// @access  Admin
router.get('/', adminAuth, getContacts);

// @route   GET api/contact/:id
// @desc    Get single contact message
// @access  Admin
router.get('/:id', adminAuth, getContactById);

// @route   PUT api/contact/:id
// @desc    Update contact status
// @access  Admin
router.put('/:id', adminAuth, updateContactStatus);

// @route   POST api/contact/:id/reply
// @desc    Reply to a contact message
// @access  Admin
router.post('/:id/reply', adminAuth, replyToContact);

// @route   DELETE api/contact/:id
// @desc    Delete contact message
// @access  Admin
router.delete('/:id', adminAuth, deleteContact);

module.exports = router;
