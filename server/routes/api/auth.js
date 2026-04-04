const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../../middleware/auth');
const { twoFactorLimiter } = require('../../middleware/rateLimiter');
const { getUser, login, adminLogin, verifyToken, changePassword, forgotPassword, resetPassword } = require('../../controllers/authController');
const { generate2FA, verify2FA, disable2FA, validate2FA } = require('../../controllers/twoFactorController');

// @route   GET api/auth
// @desc    Get authenticated user
// @access  Private
router.get('/', auth, getUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], login);

// @route   POST api/auth/admin-login
// @desc    Authenticate admin user & get token
// @access  Public
router.post('/admin-login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], adminLogin);

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   PUT api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.put('/reset-password/:token', resetPassword);

// @route   GET api/auth/verify
// @desc    Verify token is valid
// @access  Private
router.get('/verify', auth, verifyToken);

// 2FA Routes
// @route   POST api/auth/2fa/generate
// @desc    Generate 2FA secret and QR code
// @access  Private
router.post('/2fa/generate', auth, generate2FA);

// @route   POST api/auth/2fa/verify
// @desc    Verify token and enable 2FA
// @access  Private
router.post('/2fa/verify', auth, verify2FA);

// @route   POST api/auth/2fa/disable
// @desc    Disable 2FA
// @access  Private
router.post('/2fa/disable', auth, disable2FA);

// @route   POST api/auth/2fa/validate
// @desc    Validate 2FA token during login
// @access  Public
router.post('/2fa/validate', twoFactorLimiter, validate2FA);

// @route   PUT api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', auth, changePassword);

// @route   PUT api/auth/profile
// @desc    Update own profile info
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const User = require('../../models/User');
    const { firstName, lastName, phone, wechat } = req.body;
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone !== undefined) updateFields.phoneNumber = phone;
    if (wechat !== undefined) updateFields.wechatId = wechat;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
