const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const auth = require('../../middleware/auth');
const { uploadFile, getFile } = require('../../controllers/uploadController');

router.post('/', auth, upload.single('file'), uploadFile);
router.get('/:filename', auth, getFile);

module.exports = router;
