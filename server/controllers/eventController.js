const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// @desc    Get all events with pagination and filtering
exports.getEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.location) filter.location = new RegExp(req.query.location, 'i');
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }, { location: searchRegex }];
    }

    if (req.query.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (req.query.date) {
        case 'today': {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          filter.startDate = { $gte: today, $lt: tomorrow };
          break;
        }
        case 'this-week': {
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          filter.startDate = { $gte: today, $lt: nextWeek };
          break;
        }
        case 'this-month': {
          const nextMonth = new Date(today);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          filter.startDate = { $gte: today, $lt: nextMonth };
          break;
        }
        case 'future':
          filter.startDate = { $gte: today };
          break;
      }
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const events = await Event.find(filter)
      .sort({ startDate: 1 })
      .skip(startIndex)
      .limit(limit)
      .populate('organizer', ['firstName', 'lastName', 'email']);

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      count: events.length,
      pagination: { total, page, pages: Math.ceil(total / limit) },
      data: events
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get event by ID
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', ['firstName', 'lastName', 'email']);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    res.json({ success: true, data: event });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Create an event
exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, location, startDate, endDate, image, type, externalLink, attachmentFile } = req.body;

    const newEvent = new Event({
      title,
      description,
      location,
      startDate,
      endDate,
      image: image || 'no-image.jpg',
      type: type || 'general',
      externalLink: externalLink || '',
      attachmentFile: attachmentFile || '',
      organizer: req.user.id
    });

    const event = await newEvent.save();
    await event.populate('organizer', ['firstName', 'lastName', 'email']);

    res.json({ success: true, data: event });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Update an event
exports.updateEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const { title, description, location, startDate, endDate, image, type, externalLink, attachmentFile } = req.body;

    event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, location, startDate, endDate, image, type, externalLink, attachmentFile },
      { new: true }
    ).populate('organizer', ['firstName', 'lastName', 'email']);

    res.json({ success: true, data: event });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await event.deleteOne();

    res.json({ success: true, msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};
