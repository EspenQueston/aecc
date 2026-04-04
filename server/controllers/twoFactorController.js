const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');

// @desc    Generate 2FA secret and QR code
// @route   POST /api/auth/2fa/generate
// @access  Private
exports.generate2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `AECC (${req.user.email || 'user'})`,
      issuer: 'AECC'
    });

    // Store secret temporarily (not yet enabled)
    await User.findByIdAndUpdate(req.user.id, {
      twoFactorSecret: secret.base32
    });

    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrDataUrl
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Verify token and enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || token.length !== 6) {
      return res.status(400).json({ msg: 'Please provide a valid 6-digit code' });
    }

    const user = await User.findById(req.user.id).select('+twoFactorSecret');

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ msg: '2FA setup not initiated. Generate a secret first.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ success: true, msg: 'Two-factor authentication enabled' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disable2FA = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findById(req.user.id).select('+twoFactorSecret');

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ msg: '2FA is not enabled' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({ success: true, msg: 'Two-factor authentication disabled' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Validate 2FA token during login
// @route   POST /api/auth/2fa/validate
// @access  Public (used during login flow)
exports.validate2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ msg: 'User ID and token are required' });
    }

    const user = await User.findById(userId).select('+twoFactorSecret');

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ msg: '2FA is not enabled for this user' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ msg: 'Invalid 2FA code' });
    }

    res.json({ success: true, valid: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};
