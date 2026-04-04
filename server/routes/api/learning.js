const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const upload = require('../../middleware/upload');
const {
  getChannels,
  getCategories,
  getChannelsAdmin,
  createChannel,
  updateChannel,
  deleteChannel,
  getResources,
  getResourceById,
  getResourcesAdmin,
  createResource,
  updateResource,
  deleteResource
} = require('../../controllers/learningController');

// Public
router.get('/channels', getChannels);
router.get('/categories', getCategories);
router.get('/resources/public', getResources);

// Admin - Channels
router.get('/admin', auth, adminAuth, getChannelsAdmin);
router.post('/', auth, adminAuth, createChannel);
router.put('/:id', auth, adminAuth, updateChannel);
router.delete('/:id', auth, adminAuth, deleteChannel);

// Admin - Resources (formations, youtube, links)
router.get('/resources/admin', auth, adminAuth, getResourcesAdmin);
router.post('/resources', auth, adminAuth, upload.single('file'), createResource);
router.put('/resources/:id', auth, adminAuth, upload.single('file'), updateResource);
router.delete('/resources/:id', auth, adminAuth, deleteResource);

// Public - must be AFTER /resources/admin and /resources/public
router.get('/resources/:id', getResourceById);

module.exports = router;
