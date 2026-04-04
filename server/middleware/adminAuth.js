// middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, adminEmails } = require('../config/keys');

module.exports = async function(req, res, next) {
  // Support both x-auth-token and Authorization: Bearer <token>
  let token = req.header('x-auth-token');
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (decoded.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin permissions required.' });
    }

    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Use centralized admin whitelist from config/keys.js
    if (!adminEmails.includes(user.email)) {
      return res.status(403).json({ msg: 'Access denied. Not an authorized admin email.' });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
