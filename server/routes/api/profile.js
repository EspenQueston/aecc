const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { getMyProfile, createOrUpdateProfile, getAllProfiles, getProfileByUserId, deleteProfile } = require('../../controllers/profileController');

router.get('/me', auth, getMyProfile);
router.get('/', auth, getAllProfiles);
router.get('/user/:user_id', auth, getProfileByUserId);

router.post('/', auth, createOrUpdateProfile);

router.delete('/', auth, deleteProfile);

module.exports = router;
