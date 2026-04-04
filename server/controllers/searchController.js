const Event = require('../models/Event');
const Resource = require('../models/Resource');
const Profile = require('../models/Profile');
const WordPressBlogService = require('../models/wordpress/WordPressBlogService');

// @desc    Unified search across all content types
exports.search = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ msg: 'Search query must be at least 2 characters' });
    }

    const query = q.trim();
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escaped, 'i');
    const results = {};

    // Search blogs
    if (!type || type === 'blogs') {
      try {
        const blogResult = await WordPressBlogService.getPosts({
          search: query,
          post_status: 'publish',
          posts_per_page: limitNum,
          paged: pageNum
        });
        results.blogs = {
          data: blogResult.posts.map(p => ({
            _id: p._id,
            title: p.post_title,
            excerpt: p.post_excerpt || (p.post_content ? p.post_content.substring(0, 150) + '...' : ''),
            category: p.categories?.[0]?.term_id?.name || 'Uncategorized',
            createdAt: p.post_date,
            type: 'blog'
          })),
          total: blogResult.total
        };
      } catch {
        results.blogs = { data: [], total: 0 };
      }
    }

    // Search events
    if (!type || type === 'events') {
      const eventFilter = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex }
        ]
      };
      const [events, eventTotal] = await Promise.all([
        Event.find(eventFilter)
          .sort({ startDate: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .select('title description location startDate endDate image'),
        Event.countDocuments(eventFilter)
      ]);
      results.events = {
        data: events.map(e => ({ ...e.toObject(), type: 'event' })),
        total: eventTotal
      };
    }

    // Search resources
    if (!type || type === 'resources') {
      const resourceFilter = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ]
      };
      const [resources, resourceTotal] = await Promise.all([
        Resource.find(resourceFilter)
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .select('title description category type createdAt'),
        Resource.countDocuments(resourceFilter)
      ]);
      results.resources = {
        data: resources.map(r => ({ ...r.toObject(), type: 'resource' })),
        total: resourceTotal
      };
    }

    // Search profiles (search via User model since fields moved there)
    if (!type || type === 'profiles') {
      const User = require('../models/User');
      const userFilter = {
        $or: [
          { university: searchRegex },
          { fieldOfStudy: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex }
        ]
      };
      const matchingUserIds = await User.find(userFilter).select('_id');
      const profileFilter = {
        $or: [
          { user: { $in: matchingUserIds.map(u => u._id) } },
          { bio: searchRegex }
        ]
      };
      const [profiles, profileTotal] = await Promise.all([
        Profile.find(profileFilter)
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .populate('user', ['firstName', 'lastName', 'university', 'fieldOfStudy'])
          .select('bio avatar'),
        Profile.countDocuments(profileFilter)
      ]);
      results.profiles = {
        data: profiles.map(p => ({ ...p.toObject(), type: 'profile' })),
        total: profileTotal
      };
    }

    // Calculate total across all types
    const totalResults = Object.values(results).reduce((sum, r) => sum + r.total, 0);

    res.json({
      success: true,
      query,
      totalResults,
      results
    });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};
