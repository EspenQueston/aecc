const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { uploadToR2, getFromR2, isR2Configured } = require('../utils/r2');

// @desc    Upload a file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a file' });
    }

    // Try R2 upload first, fall back to local
    if (isR2Configured) {
      try {
        const result = await uploadToR2(req.file);
        if (result) {
          // Clean up local temp file if it exists
          if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          return res.json({
            success: true,
            data: {
              fileName: result.key,
              filePath: result.url,
              fileType: result.mimetype,
              fileSize: result.size,
              storage: 'r2'
            }
          });
        }
      } catch (r2Err) {
        console.error('R2 upload failed, falling back to local:', r2Err.message);
      }
    }

    // Local storage fallback
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        fileName: req.file.filename,
        filePath: fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        storage: 'local'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get uploaded file (auth required)
exports.getFile = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename); // Prevent path traversal

    // Try local first
    const uploadDir = path.resolve(__dirname, '../uploads');
    const filePath = path.join(uploadDir, filename);

    if (filePath.startsWith(uploadDir) && fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    // Try R2 if configured
    if (isR2Configured) {
      try {
        const r2Response = await getFromR2(filename);
        if (r2Response && r2Response.Body) {
          if (r2Response.ContentType) {
            res.set('Content-Type', r2Response.ContentType);
          }
          r2Response.Body.pipe(res);
          return;
        }
      } catch (r2Err) {
        // Key not found in R2
      }
    }

    return res.status(404).json({ msg: 'File not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};
