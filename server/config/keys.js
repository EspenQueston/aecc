const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Validate critical env vars in production
if (isProduction) {
  const required = ['JWT_SECRET', 'MONGO_URI', 'EMAIL_USER', 'EMAIL_PASS', 'CORS_ORIGINS', 'ADMIN_EMAILS'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
}

module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/congolese_students',
  jwtSecret: process.env.JWT_SECRET || (isProduction ? undefined : 'dev_only_jwt_secret_not_for_production'),
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Admin whitelist — from env in production, fallback in dev
  adminEmails: process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim())
    : ['cluivertmoukendi@gmail.com', 'admin@aecc.org'],

  // JWT expiration
  jwtExpiration: '24h',
  jwtRegistrationExpiration: '5d',

  // CORS origins — must be explicit in production
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : (isProduction ? [] : ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000']),

  // Upload config
  maxFileSize: 10 * 1024 * 1024, // 10MB

  // Email config (nodemailer)
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: parseInt(process.env.EMAIL_PORT) || 587,
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'AECC <noreply@aecc.org>',
};
