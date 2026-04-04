const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check } = require('express-validator');
const { getResources, getResource, createResource, updateResource, deleteResource } = require('../../controllers/resourceController');

router.get('/', getResources);
router.get('/:id', getResource);

router.post('/', [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  check('type', 'Resource type is required').not().isEmpty()
]], createResource);

router.put('/:id', auth, updateResource);
router.delete('/:id', auth, deleteResource);

module.exports = router;
