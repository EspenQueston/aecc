const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { startChat, sendMessage, getConversation, getChats, adminReply, closeChat, deleteChat } = require('../../controllers/chatController');

// Public routes
router.post('/start', startChat);
router.post('/:id/message', sendMessage);
router.get('/:id', getConversation);

// Admin routes
router.get('/', adminAuth, getChats);
router.post('/:id/admin-reply', adminAuth, adminReply);
router.put('/:id/close', adminAuth, closeChat);
router.delete('/:id', adminAuth, deleteChat);

module.exports = router;
