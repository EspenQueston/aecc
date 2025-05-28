const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const auth = require('../../middleware/auth');
const path = require('path');

// @route   POST api/upload
// @desc    Upload file
// @access  Private
router.post('/', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a file' });
    }

    // Create file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        fileName: req.file.filename,
        filePath: fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/upload/:filename
// @desc    Get uploaded file
// @access  Public
router.get('/:filename', (req, res) => {
  try {
    const uploadPath = path.join(__dirname, '../../uploads', req.params.filename);
    res.sendFile(uploadPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
