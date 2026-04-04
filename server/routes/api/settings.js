const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const SiteSetting = require('../../models/SiteSetting');

// @desc    Get a site setting by key (public)
router.get('/:key', async (req, res) => {
  try {
    const setting = await SiteSetting.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ msg: 'Setting not found' });
    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @desc    Get all site settings (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const settings = await SiteSetting.find().sort({ key: 1 });
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @desc    Upsert a site setting (admin)
router.put('/:key', adminAuth, async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ msg: 'Value is required' });

    const setting = await SiteSetting.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, value },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
