const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile
// @desc    Test route
// @access  Public
// router.get('/', (req, res) => res.send('Profile route'));

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', [
  auth,
  [
    check('university', 'University is required').not().isEmpty(),
    check('fieldOfStudy', 'Field of study is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    bio,
    university,
    fieldOfStudy,
    yearOfStudy,
    province,
    city,
    skills,
    wechat,
    whatsapp,
    telegram,
    facebook,
    twitter,
    instagram,
    linkedin,
    avatar
  } = req.body;

  // Build profile object
  const profileFields = {
    user: req.user.id
  };
  
  if (bio) profileFields.bio = bio;
  if (university) profileFields.university = university;
  if (fieldOfStudy) profileFields.fieldOfStudy = fieldOfStudy;
  if (yearOfStudy) profileFields.yearOfStudy = yearOfStudy;
  if (province) profileFields.province = province;
  if (city) profileFields.city = city;
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }
  if (avatar) profileFields.avatar = avatar;

  // Build social object
  profileFields.social = {};
  if (wechat) profileFields.social.wechat = wechat;
  if (whatsapp) profileFields.social.whatsapp = whatsapp;
  if (telegram) profileFields.social.telegram = telegram;
  if (facebook) profileFields.social.facebook = facebook;
  if (twitter) profileFields.social.twitter = twitter;
  if (instagram) profileFields.social.instagram = instagram;
  if (linkedin) profileFields.social.linkedin = linkedin;

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );

      return res.json({
        success: true,
        data: profile
      });
    }

    // Create
    profile = new Profile(profileFields);
    await profile.save();
    
    res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'email', 'avatar']);
    res.json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'email', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ 
      success: true,
      msg: 'User deleted'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
