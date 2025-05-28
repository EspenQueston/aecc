const express = require('express');
const router = express.Router();
const Resource = require('../../models/Resource');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET api/resources
// @desc    Get all resources
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Add filtering capability
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.type) filter.type = req.query.type;
    
    // Add pagination
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
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: resources
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/resources/:id
// @desc    Get resource by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    
    res.json({
      success: true,
      data: resource
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/resources
// @desc    Create a resource
// @access  Private
router.post('/', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('type', 'Resource type is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, category, type, fileUrl, externalLink } = req.body;

    // Create new resource
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
    res.json({
      success: true,
      data: resource
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/resources/:id
// @desc    Update a resource
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    
    // Check user authorization
    if (resource.user && resource.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to update this resource' });
    }

    // Build resource object
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

    res.json({
      success: true,
      data: resource
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/resources/:id
// @desc    Delete a resource
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    
    // Check user authorization
    if (resource.user && resource.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this resource' });
    }

    await resource.deleteOne();
    
    res.json({ 
      success: true,
      msg: 'Resource removed'
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;