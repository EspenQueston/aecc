const Profile = require('../models/Profile');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Fields to populate from User (single source of truth)
const USER_FIELDS = ['firstName', 'lastName', 'email', 'university', 'fieldOfStudy', 'province', 'city'];

// @desc    Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', USER_FIELDS);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Create or update user profile
exports.createOrUpdateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    bio, yearOfStudy,
    skills, wechat, whatsapp, telegram, facebook, twitter, instagram, linkedin, avatar
  } = req.body;

  const profileFields = { user: req.user.id };

  if (bio) profileFields.bio = bio;
  if (yearOfStudy) profileFields.yearOfStudy = yearOfStudy;
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }
  if (avatar) {
    // Validate avatar URL to prevent javascript: and other dangerous protocols
    try {
      const parsed = new URL(avatar);
      if (['http:', 'https:'].includes(parsed.protocol)) {
        profileFields.avatar = avatar;
      }
    } catch {
      // If not a valid URL, check if it's a relative path (e.g., /uploads/...)
      if (avatar.startsWith('/uploads/')) {
        profileFields.avatar = avatar;
      }
    }
  }

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
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      ).populate('user', USER_FIELDS);
      return res.json({ success: true, data: profile });
    }

    profile = new Profile(profileFields);
    await profile.save();
    profile = await profile.populate('user', USER_FIELDS);
    res.json({ success: true, data: profile });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get all profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const startIndex = (page - 1) * limit;

    const filter = {};
    // Search across populated user fields via aggregation or post-filter
    const profiles = await Profile.find(filter)
      .populate('user', USER_FIELDS)
      .skip(startIndex)
      .limit(limit);

    const total = await Profile.countDocuments(filter);

    res.json({
      success: true,
      count: profiles.length,
      pagination: { total, page, pages: Math.ceil(total / limit) },
      data: profiles
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get profile by user ID
exports.getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id })
      .populate('user', USER_FIELDS);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Delete profile, user & posts
exports.deleteProfile = async (req, res) => {
  try {
    await Profile.findOneAndDelete({ user: req.user.id });
    await User.findOneAndDelete({ _id: req.user.id });
    res.json({ success: true, msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};
