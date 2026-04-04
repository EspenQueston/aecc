const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { port, nodeEnv, corsOrigins } = require('./config/keys');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter, contactLimiter } = require('./middleware/rateLimiter');

const app = express();

// Connect to MongoDB
connectDB();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // React app manages its own CSP
  crossOriginEmbedderPolicy: false
}));

// Middleware
app.use(express.json({ extended: false, limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS - origins from config/keys.js
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

// API Routes (with rate limiting)
app.use('/api/auth', authLimiter, require('./routes/api/auth'));
app.use('/api/users', authLimiter, require('./routes/api/users'));
app.use('/api/blogs', apiLimiter, require('./routes/api/blogs'));
app.use('/api/events', apiLimiter, require('./routes/api/events'));
app.use('/api/profile', apiLimiter, require('./routes/api/profile'));
app.use('/api/resources', apiLimiter, require('./routes/api/resources'));
app.use('/api/upload', apiLimiter, require('./routes/api/upload'));
app.use('/api/system', apiLimiter, require('./routes/api/system'));
app.use('/api/contact', contactLimiter, require('./routes/api/contact'));
app.use('/api/newsletter', apiLimiter, require('./routes/api/newsletter'));
app.use('/api/search', apiLimiter, require('./routes/api/search'));
app.use('/api/faq', apiLimiter, require('./routes/api/faq'));
app.use('/api/chat', apiLimiter, require('./routes/api/chat'));
app.use('/api/learning', apiLimiter, require('./routes/api/learning'));
app.use('/api/settings', apiLimiter, require('./routes/api/settings'));

// Uploaded files served through /api/upload/:filename (auth-protected)

// Serve React frontend (client-react/dist)
const clientBuild = path.join(__dirname, '../client-react/dist');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

// Centralized error handler
app.use(errorHandler);

const PORT = port;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} [${nodeEnv}]`));
}

module.exports = app;
