const errorHandler = (err, req, res, _next) => {
  console.error(err.stack);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ msg: 'File too large. Maximum size is 10MB.' });
  }

  // Multer unexpected field
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ msg: 'Unexpected file field.' });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({ msg: e.message }));
    return res.status(400).json({ errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ msg: 'Duplicate field value entered' });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(404).json({ msg: 'Resource not found' });
  }

  // In production, never leak internal error details
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.statusCode || 500).json({
    msg: isProduction ? 'Server Error' : (err.message || 'Server Error')
  });
};

module.exports = errorHandler;
