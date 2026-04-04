const Newsletter = require('../models/Newsletter');
const { validationResult } = require('express-validator');

// @desc    Subscribe to newsletter
exports.subscribe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    let subscriber = await Newsletter.findOne({ email });

    if (subscriber) {
      if (subscriber.active) {
        return res.status(400).json({ msg: 'Already subscribed' });
      }
      subscriber.active = true;
      subscriber.unsubscribedAt = undefined;
      await subscriber.save();
      return res.json({ success: true, message: 'Successfully re-subscribed' });
    }

    subscriber = new Newsletter({ email });
    await subscriber.save();

    res.status(201).json({ success: true, message: 'Successfully subscribed to newsletter' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Unsubscribe from newsletter
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await Newsletter.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ msg: 'Email not found in subscribers' });
    }

    subscriber.active = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.json({ success: true, message: 'Successfully unsubscribed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get all subscribers (admin)
exports.getSubscribers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active !== undefined) {
      filter.active = req.query.active === 'true';
    }

    const subscribers = await Newsletter.find(filter).sort({ subscribedAt: -1 });
    res.json({ success: true, count: subscribers.length, data: subscribers });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};
