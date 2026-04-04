const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const { check } = require('express-validator');
const { commentLimiter } = require('../../middleware/rateLimiter');
const {
  getPosts, getPost, createPost, updatePost, deletePost,
  getCategories, getTags, createCategory, createTag,
  addComment, getComments, incrementView, getPostStats
} = require('../../controllers/blogController');

// Posts
router.get('/', getPosts);
router.get('/categories/all', getCategories);
router.get('/tags/all', getTags);
router.get('/:id', getPost);
router.get('/:id/comments', getComments);
router.get('/:id/stats', getPostStats);

router.post('/', [adminAuth, [
  check('title', 'Title is required').not().isEmpty(),
  check('content', 'Content is required').not().isEmpty()
]], createPost);

router.put('/:id', [adminAuth, [
  check('title', 'Title is required').optional().not().isEmpty(),
  check('content', 'Content is required').optional().not().isEmpty()
]], updatePost);

router.delete('/:id', adminAuth, deletePost);

// Categories & Tags
router.post('/categories', [auth, [
  check('name', 'Category name is required').not().isEmpty()
]], createCategory);

router.post('/tags', [auth, [
  check('name', 'Tag name is required').not().isEmpty()
]], createTag);

// Comments (rate limited)
router.post('/:id/comments', commentLimiter, [
  check('author_name', 'Author name is required').not().isEmpty(),
  check('author_email', 'Valid email is required').isEmail(),
  check('content', 'Comment content is required').not().isEmpty()
], addComment);

// Stats (rate limited)
router.post('/:id/view', commentLimiter, incrementView);

module.exports = router;
