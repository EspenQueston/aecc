const Resource = require('../models/Resource');
const { validationResult } = require('express-validator');

// @desc    Get all resources
exports.getResources = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Resource.countDocuments(filter);

    res.json({
      success: true,
      count: resources.length,
      pagination: { total, page, pages: Math.ceil(total / limit) },
      data: resources
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get resource by ID
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    res.json({ success: true, data: resource });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Create a resource
exports.createResource = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, category, type, fileUrl, externalLink } = req.body;

    const newResource = new Resource({
      title,
      description,
      category,
      type,
      fileUrl,
      externalLink,
      user: req.user.id
    });

    const resource = await newResource.save();
    res.json({ success: true, data: resource });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Update a resource
exports.updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    if (resource.user && resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const resourceFields = {};
    if (req.body.title) resourceFields.title = req.body.title;
    if (req.body.description) resourceFields.description = req.body.description;
    if (req.body.category) resourceFields.category = req.body.category;
    if (req.body.type) resourceFields.type = req.body.type;
    if (req.body.fileUrl) resourceFields.fileUrl = req.body.fileUrl;
    if (req.body.externalLink) resourceFields.externalLink = req.body.externalLink;

    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: resourceFields },
      { new: true }
    );

    res.json({ success: true, data: resource });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Delete a resource
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    if (resource.user && resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await resource.deleteOne();
    res.json({ success: true, msg: 'Resource removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};
