const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development';

// In development, bypass all rate limits
const skipInDev = () => isDev;

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { msg: 'Too many requests, please try again after 15 minutes.' }
});

// Strict limiter for auth routes (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { msg: 'Too many login attempts, please try again after 15 minutes.' }
});

// Contact/newsletter limiter
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { msg: 'Too many submissions, please try again later.' }
});

// 2FA validation limiter — strict to prevent brute force on 6-digit codes
const twoFactorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { msg: 'Too many 2FA attempts, please try again after 1 minute.' }
});

// Comment limiter
const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { msg: 'Too many comments, please try again later.' }
});

module.exports = { apiLimiter, authLimiter, contactLimiter, twoFactorLimiter, commentLimiter };
