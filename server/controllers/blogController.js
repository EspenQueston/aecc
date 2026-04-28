const WordPressBlogService = require('../models/wordpress/WordPressBlogService');
const { validationResult } = require('express-validator');

// @desc    Get posts with filtering/pagination
exports.getPosts = async (req, res) => {
  try {
    const queryArgs = {
      post_type: req.query.post_type || 'post',
      post_status: req.query.post_status || 'publish',
      posts_per_page: parseInt(req.query.limit) || parseInt(req.query.posts_per_page) || 10,
      paged: parseInt(req.query.page) || parseInt(req.query.paged) || 1,
      orderby: req.query.orderby || 'post_date',
      order: req.query.order || 'DESC',
      category_name: req.query.category || req.query.category_name,
      tag: req.query.tag,
      author: req.query.author,
      search: req.query.search || req.query.s,
    };

    if (req.query.date_after || req.query.date_before) {
      queryArgs.date_query = {};
      if (req.query.date_after) queryArgs.date_query.after = req.query.date_after;
      if (req.query.date_before) queryArgs.date_query.before = req.query.date_before;
    }

    const result = await WordPressBlogService.getPosts(queryArgs);

    const transformedPosts = result.posts.map(post => ({
      _id: post._id,
      title: post.post_title,
      content: post.post_content,
      category: post.categories && post.categories.length > 0
        ? post.categories[0].term_id.name
        : 'Uncategorized',
      categories: post.categories,
      featuredImage: post.featured_image || 'no-image.jpg',
      user: post.author,
      author: post.post_author
        ? `${post.post_author.firstName || ''} ${post.post_author.lastName || ''}`.trim() || 'Anonymous Author'
        : 'Anonymous Author',
      createdAt: post.post_date,
      updatedAt: post.post_modified,
      views: post.view_count || 0,
      likes: [],
      comments: post.comments || [],
      excerpt: post.post_excerpt
    }));

    res.json({
      success: true,
      count: transformedPosts.length,
      data: transformedPosts,
      pagination: {
        total: result.pagination.total,
        page: result.pagination.page,
        pages: result.pagination.pages,
        limit: result.pagination.per_page
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single post by ID or slug
exports.getPost = async (req, res) => {
  try {
    const post = await WordPressBlogService.getPost(req.params.id);

    const transformedPost = {
      _id: post._id,
      title: post.post_title,
      content: post.post_content,
      category: post.categories && post.categories.length > 0
        ? (post.categories[0].term_id ? post.categories[0].term_id.name : post.categories[0].name)
        : 'Uncategorized',
      categories: post.categories,
      featuredImage: post.featured_image || 'no-image.jpg',
      user: post.author,
      author: post.post_author
        ? `${post.post_author.firstName || ''} ${post.post_author.lastName || ''}`.trim() || 'Anonymous Author'
        : 'Anonymous Author',
      createdAt: post.post_date,
      updatedAt: post.post_modified,
      views: post.view_count || 0,
      likes: [],
      comments: post.comments || [],
      excerpt: post.post_excerpt,
      tags: post.tags || []
    };

    res.json({ success: true, data: transformedPost });
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Post not found') {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a new post
exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      title, content, excerpt, status, comment_status,
      featured_image, featuredImage, categories, tags, meta
    } = req.body;

    const postData = {
      title,
      content,
      excerpt,
      status: status || 'publish',
      comment_status: comment_status || 'open',
      featured_image: featured_image || featuredImage
    };

    const post = await WordPressBlogService.createPost(
      postData, req.user.id, categories || [], tags || [], meta || {}
    );

    res.status(201).json({ success: true, data: post, message: 'Post created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update a post
exports.updatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, content, excerpt, post_status, comment_status, featured_image, categories, tags, meta } = req.body;

    const updateData = {};
    if (title) updateData.post_title = title;
    if (content) updateData.post_content = content;
    if (excerpt) updateData.post_excerpt = excerpt;
    if (post_status) updateData.post_status = post_status;
    if (comment_status) updateData.comment_status = comment_status;
    if (featured_image) updateData.featured_image = featured_image;

    const post = await WordPressBlogService.updatePost(
      req.params.id, updateData, categories, tags, meta
    );

    res.json({ success: true, data: post, message: 'Post updated successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Post not found') {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a post
exports.deletePost = async (req, res) => {
  try {
    const permanent = req.query.permanent === 'true';
    await WordPressBlogService.deletePost(req.params.id, permanent);

    res.json({
      success: true,
      message: permanent ? 'Post permanently deleted' : 'Post moved to trash'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await WordPressBlogService.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all tags
exports.getTags = async (req, res) => {
  try {
    const tags = await WordPressBlogService.getTags();
    res.json({ success: true, data: tags });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a category
exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, description, parent } = req.body;
    const category = await WordPressBlogService.createCategory(name, description, parent);
    res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a tag
exports.createTag = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, description } = req.body;
    const tag = await WordPressBlogService.createTag(name, description);
    res.status(201).json({ success: true, data: tag, message: 'Tag created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Add comment to a post
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { author_name, author_email, author_url, content, parent, user_id } = req.body;

    const commentData = {
      author_name,
      author_email,
      author_url,
      content,
      parent,
      user_id,
      author_ip: req.ip,
      user_agent: req.get('User-Agent')
    };

    const comment = await WordPressBlogService.addComment(req.params.id, commentData);
    res.status(201).json({ success: true, data: comment, message: 'Comment added successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 10,
      page: parseInt(req.query.page) || 1
    };

    const comments = await WordPressBlogService.getPostComments(req.params.id, options);
    res.json({ success: true, data: comments });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Increment view count
exports.incrementView = async (req, res) => {
  try {
    const post = await WordPressBlogService.incrementViewCount(req.params.id);
    res.json({
      success: true,
      data: { view_count: post.view_count, message: 'View count updated successfully' }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get post statistics
exports.getPostStats = async (req, res) => {
  try {
    const stats = await WordPressBlogService.getPostStats(req.params.id);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
