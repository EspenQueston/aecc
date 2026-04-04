const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwtSecret, jwtRegistrationExpiration } = require('../config/keys');
const { validationResult } = require('express-validator');
const { sendEmail, wrapEmailTemplate } = require('../utils/email');

// @desc    Register user (sends verification email)
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { personal, academic, account } = req.body;

  try {
    let user = await User.findOne({
      $or: [
        { email: account.email },
        { passportNumber: personal.passportNumber }
      ]
    });

    if (user) {
      return res.status(400).json({
        errors: [{ msg: 'User already exists with this email or passport number' }]
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    user = new User({
      ...personal,
      ...academic,
      email: account.email,
      password: account.password,
      passportFile: req.files?.passportFile?.[0]?.path,
      visaFile: req.files?.visaFile?.[0]?.path,
      admissionFile: req.files?.admissionFile?.[0]?.path,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    });

    await user.save();

    // Build verification URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const verifyUrl = `${baseUrl}/api/users/verify-email/${verificationToken}`;

    // Send verification email
    await sendEmail({
      to: account.email,
      subject: 'AECC — Vérifiez votre adresse email',
      html: wrapEmailTemplate(`
        <h2 style="color:#1a1a1a;margin:0 0 .5rem">Bienvenue ${personal.firstName} !</h2>
        <p style="color:#555;font-size:.95rem;line-height:1.6">
          Merci de vous être inscrit(e) sur la plateforme AECC. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
        </p>
        <div style="text-align:center;margin:1.5rem 0">
          <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#B7222D,#d4303d);color:#fff;padding:.8rem 2rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:.95rem">
            Vérifier mon email
          </a>
        </div>
        <p style="color:#888;font-size:.82rem;text-align:center">
          Ce lien expire dans <strong>24 heures</strong>.<br>
          Si vous n'avez pas créé de compte, ignorez cet email.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:1.5rem 0">
        <p style="color:#aaa;font-size:.75rem;text-align:center">
          Si le bouton ne fonctionne pas, copiez ce lien :<br>
          <a href="${verifyUrl}" style="color:#B7222D;word-break:break-all">${verifyUrl}</a>
        </p>
      `)
    });

    res.json({ requiresVerification: true, email: account.email });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Verify email with token
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      // Redirect to frontend with error
      return res.redirect('/?verified=expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Redirect to frontend login page with success
    res.redirect('/?verified=success');
  } catch (err) {
    console.error(err.message);
    res.redirect('/?verified=error');
  }
};

// @desc    Resend verification email
exports.resendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email requis' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Aucun compte trouvé avec cet email' });
    if (user.isEmailVerified) return res.status(400).json({ msg: 'Cet email est déjà vérifié' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const verifyUrl = `${baseUrl}/api/users/verify-email/${verificationToken}`;

    await sendEmail({
      to: email,
      subject: 'AECC — Nouveau lien de vérification',
      html: wrapEmailTemplate(`
        <p style="color:#555;font-size:.95rem;line-height:1.6">
          Voici votre nouveau lien de vérification. Il expire dans <strong>24 heures</strong>.
        </p>
        <div style="text-align:center;margin:1.5rem 0">
          <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#B7222D,#d4303d);color:#fff;padding:.8rem 2rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:.95rem">
            Vérifier mon email
          </a>
        </div>
      `)
    });

    res.json({ success: true, msg: 'Email de vérification renvoyé' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get all users (admin)
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const startIndex = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const s = new RegExp(escaped, 'i');
      filter.$or = [{ firstName: s }, { lastName: s }, { email: s }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(startIndex).limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: users.length,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      data: users
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get user by ID (admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'User not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Admin create user (simplified, no file uploads)
exports.adminCreateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, wechat, university, fieldOfStudy, degreeLevel } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ msg: 'Nom, prénom, email et mot de passe sont obligatoires' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Un utilisateur avec cet email existe déjà' });

    const user = new User({
      firstName, lastName, email, password,
      role: role || 'student',
      phoneNumber: phone, wechatId: wechat,
      university, fieldOfStudy,
      degreeLevel: degreeLevel || 'bachelor',
      isEmailVerified: true // Admin-created users are pre-verified
    });
    await user.save();
    const saved = await User.findById(user._id).select('-password');
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Update user (admin)
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, secondName, email, role, password, phone, wechat, university, fieldOfStudy, degreeLevel } = req.body;
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (secondName !== undefined) updateFields.secondName = secondName;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (phone) updateFields.phoneNumber = phone;
    if (wechat) updateFields.wechatId = wechat;
    if (university) updateFields.university = university;
    if (fieldOfStudy) updateFields.fieldOfStudy = fieldOfStudy;
    if (degreeLevel) updateFields.degreeLevel = degreeLevel;

    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'User not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Delete user (admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    await user.deleteOne();
    res.json({ success: true, msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'User not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
};
