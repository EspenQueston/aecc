const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwtSecret, jwtExpiration, adminEmails } = require('../config/keys');
const { validationResult } = require('express-validator');
const { sendEmail, wrapEmailTemplate } = require('../utils/email');

// @desc    Get authenticated user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Authenticate user & get token
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, twoFactorToken } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');

    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Block unverified users
    if (!user.isEmailVerified) {
      return res.status(403).json({
        errors: [{ msg: 'Veuillez vérifier votre adresse email avant de vous connecter' }],
        needsVerification: true,
        email: user.email
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorToken) {
        return res.status(200).json({
          requires2FA: true,
          userId: user.id
        });
      }

      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 1
      });

      if (!verified) {
        return res.status(400).json({ errors: [{ msg: 'Invalid 2FA code' }] });
      }
    }

    const payload = {
      user: { id: user.id, role: user.role }
    };

    jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiration }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Authenticate admin user & get token
exports.adminLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, twoFactorToken } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');

    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Use centralized admin whitelist from config/keys.js
    if (!adminEmails.includes(email)) {
      return res.status(403).json({ errors: [{ msg: 'Not authorized as admin' }] });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorToken) {
        return res.status(200).json({
          requires2FA: true,
          userId: user.id
        });
      }

      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 1
      });

      if (!verified) {
        return res.status(400).json({ errors: [{ msg: 'Invalid 2FA code' }] });
      }
    }

    if (user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const payload = {
      user: { id: user.id, role: user.role }
    };

    jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiration }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Verify token is valid
exports.verifyToken = (req, res) => {
  res.json({ valid: true });
};

// @desc    Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: 'Current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ msg: 'New password must be at least 8 characters' });
  }

  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Forgot password — send reset link
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email requis' });

  try {
    const user = await User.findOne({ email });

    // Always return success to avoid user enumeration
    if (!user) {
      return res.json({ success: true, msg: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // Build reset URL (frontend route)
    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${origin}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'AECC — Réinitialisation de votre mot de passe',
      html: wrapEmailTemplate(`
        <h2 style="color:#1a1a1a;margin:0 0 .5rem">Réinitialisation du mot de passe</h2>
        <p style="color:#555;font-size:.95rem;line-height:1.6">
          Bonjour <strong>${user.firstName}</strong>,<br>
          Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau.
        </p>
        <div style="text-align:center;margin:1.5rem 0">
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#B7222D,#d4303d);color:#fff;padding:.8rem 2rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:.95rem">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="color:#888;font-size:.82rem;text-align:center">
          Ce lien expire dans <strong>1 heure</strong>.<br>
          Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:1.5rem 0">
        <p style="color:#aaa;font-size:.75rem;text-align:center">
          Si le bouton ne fonctionne pas, copiez ce lien :<br>
          <a href="${resetUrl}" style="color:#B7222D;word-break:break-all">${resetUrl}</a>
        </p>
      `)
    });

    res.json({ success: true, msg: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Reset password with token
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).json({ msg: 'Le mot de passe doit contenir au moins 8 caractères' });
  }

  try {
    // Hash the token from the URL to compare with the stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Le lien de réinitialisation est invalide ou a expiré.' });
    }

    // Set new password & clear reset fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'AECC — Mot de passe modifié avec succès',
      html: wrapEmailTemplate(`
        <h2 style="color:#1a1a1a;margin:0 0 .5rem">Mot de passe modifié</h2>
        <p style="color:#555;font-size:.95rem;line-height:1.6">
          Bonjour <strong>${user.firstName}</strong>,<br>
          Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
        </p>
        <div style="text-align:center;margin:1.5rem 0">
          <a href="${req.headers.origin || `${req.protocol}://${req.get('host')}`}/register" style="display:inline-block;background:linear-gradient(135deg,#B7222D,#d4303d);color:#fff;padding:.8rem 2rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:.95rem">
            Se connecter
          </a>
        </div>
        <p style="color:#e74c3c;font-size:.82rem;text-align:center">
          <i>⚠️ Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.</i>
        </p>
      `)
    });

    res.json({ success: true, msg: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};
