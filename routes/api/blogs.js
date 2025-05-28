const express = require('express');
const router = express.Router();
const Blog = require('../../models/Blog');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET api/blogs
// @desc    Get all blogs with pagination and filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Add filtering capability
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', ['name', 'avatar']);
      
    const total = await Blog.countDocuments(filter);
    
    res.json({
      success: true,
      count: blogs.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: blogs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/blogs/categories
// @desc    Get all blog categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = Blog.schema.path('category').enumValues;
    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/blogs/:id
// @desc    Get blog by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('user', ['name', 'avatar']);
    
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    
    res.json({
      success: true,
      data: blog
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/blogs
// @desc    Create a blog
// @access  Private
router.post('/', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content, category, featuredImage } = req.body;

    // Create new blog
    const newBlog = new Blog({
      title,
      content,
      category,
      featuredImage: featuredImage || 'no-image.jpg',
      user: req.user.id
    });

    const blog = await newBlog.save();
    
    res.json({
      success: true,
      data: blog
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/blogs/:id
// @desc    Update a blog
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    
    // Check user authorization
    if (blog.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to update this blog' });
    }

    // Build blog object
    const blogFields = {};
    if (req.body.title) blogFields.title = req.body.title;
    if (req.body.content) blogFields.content = req.body.content;
    if (req.body.category) blogFields.category = req.body.category;
    if (req.body.featuredImage) blogFields.featuredImage = req.body.featuredImage;

    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: blogFields },
      { new: true }
    );

    res.json({
      success: true,
      data: blog
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/blogs/:id
// @desc    Delete a blog
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    
    // Check user authorization
    if (blog.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this blog' });
    }

    await blog.deleteOne();
    
    res.json({ 
      success: true,
      msg: 'Blog removed'
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
