const express = require('express');
const router = express.Router();
const { search } = require('../../controllers/searchController');

// @route    GET api/search?q=query&type=blogs|events|resources|profiles&page=1&limit=10
// @desc     Unified search across all content
// @access   Public
router.get('/', search);

module.exports = router;
