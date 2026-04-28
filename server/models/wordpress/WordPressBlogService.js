const Post = require('./Post');
const PostMeta = require('./PostMeta');
const Term = require('./Term');
const TermTaxonomy = require('./TermTaxonomy');
const TermRelationship = require('./TermRelationship');
const Comment = require('./Comment');
const CommentMeta = require('./CommentMeta');

/**
 * WordPress-inspired Blog Service
 * This service provides high-level methods that mirror WordPress functionality
 */
class WordPressBlogService {
  
  /**
   * Create a new blog post (equivalent to wp_insert_post)
   */
  static async createPost(postData, authorId, categories = [], tags = [], meta = {}) {
    try {
      // Create the post
      const post = new Post({
        post_author: authorId,
        post_title: postData.title,
        post_content: postData.content,
        post_excerpt: postData.excerpt,
        post_status: postData.status || 'draft',
        post_type: 'post',
        comment_status: postData.comment_status || 'open',
        featured_image: postData.featured_image || 'no-image.jpg'
      });
      
      await post.save();
      
      // Add categories
      if (categories.length > 0) {
        await this.assignCategoriesToPost(post._id, categories);
      }
      
      // Add tags
      if (tags.length > 0) {
        await this.assignTagsToPost(post._id, tags);
      }
      
      // Add meta fields
      if (Object.keys(meta).length > 0) {
        await this.setPostMeta(post._id, meta);
      }
      
      return post;
    } catch (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }
  
  /**
   * Get posts with WordPress-style query parameters
   */
  static async getPosts(queryArgs = {}) {
    try {
      const {
        post_type = 'post',
        post_status = 'publish',
        posts_per_page = 10,
        paged = 1,
        orderby = 'post_date',
        order = 'DESC',
        category_name = null,
        tag = null,
        author = null,
        meta_query = null,
        date_query = null,
        search = null
      } = queryArgs;
      
      let query = {
        post_type,
        post_status
      };
      
      // Author filter
      if (author) {
        query.post_author = author;
      }
      
      // Date query
      if (date_query) {
        if (date_query.after) {
          query.post_date = { ...query.post_date, $gte: new Date(date_query.after) };
        }
        if (date_query.before) {
          query.post_date = { ...query.post_date, $lte: new Date(date_query.before) };
        }
      }
      
      // Search query - search in title, content, and excerpt
      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search
        query.$or = [
          { post_title: searchRegex },
          { post_content: searchRegex },
          { post_excerpt: searchRegex }
        ];
      }
      
      let postsQuery = Post.find(query);
      let countQuery = Post.find(query);
      
      // Category filter
      if (category_name) {
        const categoryPosts = await this.getPostsByCategory(category_name);
        const postIds = categoryPosts.map(p => p._id);
        postsQuery = postsQuery.where('_id').in(postIds);
        countQuery = countQuery.where('_id').in(postIds);
      }
      
      // Tag filter
      if (tag) {
        const taggedPosts = await this.getPostsByTag(tag);
        const postIds = taggedPosts.map(p => p._id);
        postsQuery = postsQuery.where('_id').in(postIds);
        countQuery = countQuery.where('_id').in(postIds);
      }
      
      // Sorting
      const sortOrder = order === 'DESC' ? -1 : 1;
      const sortObj = {};
      sortObj[orderby] = sortOrder;
      
      // Execute query with pagination
      const skip = (paged - 1) * posts_per_page;
      const posts = await postsQuery
        .populate('post_author', 'firstName lastName avatar')
        .sort(sortObj)
        .skip(skip)
        .limit(posts_per_page);
      
      // Get total count for pagination (filtered count)
      const total = await countQuery.countDocuments();
      
      // Attach categories, tags, and meta to each post
      for (let post of posts) {
        post.categories = await this.getPostCategories(post._id);
        post.tags = await this.getPostTags(post._id);
        post.meta = await this.getPostMeta(post._id);
      }
      
      return {
        posts,
        pagination: {
          page: paged,
          pages: Math.ceil(total / posts_per_page),
          total: total,
          per_page: posts_per_page
        }
      };
    } catch (error) {
      throw new Error(`Failed to get posts: ${error.message}`);
    }
  }
  
  /**
   * Get a single post by ID or slug
   */
  static async getPost(identifier) {
    try {
      let post;

      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        // Try as ObjectId (production — MongoDB Atlas stores proper ObjectIds)
        post = await Post.findById(identifier).populate('post_author', 'firstName lastName avatar');

        if (!post) {
          // Fallback: _id was imported as a plain string (local dev after non-EJSON JSON import).
          // Use the raw driver to find by string _id, then re-fetch by post_name.
          const raw = await Post.collection.findOne({ _id: identifier });
          if (raw && raw.post_name) {
            post = await Post.findOne({ post_name: raw.post_name })
              .populate('post_author', 'firstName lastName avatar');
          }
        }
      } else {
        post = await Post.findOne({ post_name: identifier }).populate('post_author', 'firstName lastName avatar');
      }

      if (!post) {
        throw new Error('Post not found');
      }

      // Attach categories, tags, meta, and comments
      post.categories = await this.getPostCategories(post._id);
      post.tags = await this.getPostTags(post._id);
      post.meta = await this.getPostMeta(post._id);
      post.comments = await Comment.getApprovedComments(post._id);

      return post;
    } catch (error) {
      throw new Error(`Failed to get post: ${error.message}`);
    }
  }
  
  /**
   * Update a post
   */
  static async updatePost(postId, updateData, categories = null, tags = null, meta = null) {
    try {
      const post = await Post.findByIdAndUpdate(postId, updateData, { new: true });
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Update categories if provided
      if (categories !== null) {
        await this.replacePostCategories(postId, categories);
      }
      
      // Update tags if provided
      if (tags !== null) {
        await this.replacePostTags(postId, tags);
      }
      
      // Update meta if provided
      if (meta !== null) {
        await this.setPostMeta(postId, meta);
      }
      
      return post;
    } catch (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }
  }
  
  /**
   * Delete a post (move to trash or permanent delete)
   */
  static async deletePost(postId, permanent = false) {
    try {
      if (permanent) {
        // Permanent delete - remove all related data
        await TermRelationship.deleteMany({ object_id: postId });
        await PostMeta.deleteMany({ post_id: postId });
        await Comment.deleteMany({ comment_post_ID: postId });
        await Post.findByIdAndDelete(postId);
      } else {
        // Move to trash
        await Post.findByIdAndUpdate(postId, { post_status: 'trash' });
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }
  
  /**
   * Create or get a category
   */
  static async createCategory(name, description = '', parent = null) {
    try {
      // Check if term exists
      let term = await Term.findOne({ name });
      if (!term) {
        term = new Term({ name });
        await term.save();
      }
      
      // Check if taxonomy exists
      let taxonomy = await TermTaxonomy.findOne({ term_id: term._id, taxonomy: 'category' });
      if (!taxonomy) {
        taxonomy = new TermTaxonomy({
          term_id: term._id,
          taxonomy: 'category',
          description,
          parent
        });
        await taxonomy.save();
      }
      
      return { term, taxonomy };
    } catch (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }
  
  /**
   * Create or get a tag
   */
  static async createTag(name, description = '') {
    try {
      // Check if term exists
      let term = await Term.findOne({ name });
      if (!term) {
        term = new Term({ name });
        await term.save();
      }
      
      // Check if taxonomy exists
      let taxonomy = await TermTaxonomy.findOne({ term_id: term._id, taxonomy: 'post_tag' });
      if (!taxonomy) {
        taxonomy = new TermTaxonomy({
          term_id: term._id,
          taxonomy: 'post_tag',
          description
        });
        await taxonomy.save();
      }
      
      return { term, taxonomy };
    } catch (error) {
      throw new Error(`Failed to create tag: ${error.message}`);
    }
  }
  
  /**
   * Get all categories
   */
  static async getCategories() {
    try {
      return await TermTaxonomy.find({ taxonomy: 'category' })
        .populate('term_id')
        .populate('parent');
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }
  
  /**
   * Get all tags
   */
  static async getTags() {
    try {
      return await TermTaxonomy.find({ taxonomy: 'post_tag' })
        .populate('term_id');
    } catch (error) {
      throw new Error(`Failed to get tags: ${error.message}`);
    }
  }
  
  /**
   * Assign categories to a post
   */
  static async assignCategoriesToPost(postId, categoryNames) {
    try {
      for (const categoryName of categoryNames) {
        const { taxonomy } = await this.createCategory(categoryName);
        await TermRelationship.assignCategoryToPost(postId, taxonomy._id);
      }
    } catch (error) {
      throw new Error(`Failed to assign categories: ${error.message}`);
    }
  }
  
  /**
   * Assign tags to a post
   */
  static async assignTagsToPost(postId, tagNames) {
    try {
      for (const tagName of tagNames) {
        const { taxonomy } = await this.createTag(tagName);
        await TermRelationship.assignCategoryToPost(postId, taxonomy._id);
      }
    } catch (error) {
      throw new Error(`Failed to assign tags: ${error.message}`);
    }
  }
  
  /**
   * Get post categories
   */
  static async getPostCategories(postId) {
    try {
      return await TermRelationship.getPostCategories(postId);
    } catch (error) {
      throw new Error(`Failed to get post categories: ${error.message}`);
    }
  }
  
  /**
   * Get post tags
   */
  static async getPostTags(postId) {
    try {
      return await TermRelationship.getPostTags(postId);
    } catch (error) {
      throw new Error(`Failed to get post tags: ${error.message}`);
    }
  }
  
  /**
   * Get posts by category
   */
  static async getPostsByCategory(categoryName) {
    try {
      const term = await Term.findOne({ name: categoryName });
      if (!term) return [];
      
      const taxonomy = await TermTaxonomy.findOne({ term_id: term._id, taxonomy: 'category' });
      if (!taxonomy) return [];
      
      return await TermRelationship.getPostsByCategory(taxonomy._id);
    } catch (error) {
      throw new Error(`Failed to get posts by category: ${error.message}`);
    }
  }
  
  /**
   * Get posts by tag
   */
  static async getPostsByTag(tagName) {
    try {
      const term = await Term.findOne({ name: tagName });
      if (!term) return [];
      
      const taxonomy = await TermTaxonomy.findOne({ term_id: term._id, taxonomy: 'post_tag' });
      if (!taxonomy) return [];
      
      return await TermRelationship.getPostsByCategory(taxonomy._id);
    } catch (error) {
      throw new Error(`Failed to get posts by tag: ${error.message}`);
    }
  }
  
  /**
   * Set post meta
   */
  static async setPostMeta(postId, meta) {
    try {
      if (typeof meta === 'object') {
        for (const [key, value] of Object.entries(meta)) {
          await PostMeta.setMetaValue(postId, key, value);
        }
      }
    } catch (error) {
      throw new Error(`Failed to set post meta: ${error.message}`);
    }
  }
  
  /**
   * Get post meta
   */
  static async getPostMeta(postId, metaKey = null) {
    try {
      if (metaKey) {
        return await PostMeta.getMetaValue(postId, metaKey);
      } else {
        return await PostMeta.getPostMeta(postId);
      }
    } catch (error) {
      throw new Error(`Failed to get post meta: ${error.message}`);
    }
  }
  
  /**
   * Add a comment to a post
   */
  static async addComment(postId, commentData) {
    try {
      const comment = new Comment({
        comment_post_ID: postId,
        comment_author: commentData.author_name,
        comment_author_email: commentData.author_email,
        comment_author_url: commentData.author_url || '',
        comment_content: commentData.content,
        comment_parent: commentData.parent || null,
        user_id: commentData.user_id || null,
        comment_author_IP: commentData.author_ip || '',
        comment_agent: commentData.user_agent || ''
      });
      
      await comment.save();
      
      // Update comment count in post
      const post = await Post.findById(postId);
      if (post) {
        post.comment_count += 1;
        await post.save();
      }
      
      return comment;
    } catch (error) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }
  
  /**
   * Get comments for a post
   */
  static async getPostComments(postId, options = {}) {
    try {
      return await Comment.getApprovedComments(postId, options);
    } catch (error) {
      throw new Error(`Failed to get comments: ${error.message}`);
    }
  }
  
  /**
   * Replace post categories (remove old, add new)
   */
  static async replacePostCategories(postId, categoryNames) {
    try {
      // Remove existing categories
      const existingCategories = await this.getPostCategories(postId);
      for (const category of existingCategories) {
        await TermRelationship.removeCategoryFromPost(postId, category._id);
      }
      
      // Add new categories
      await this.assignCategoriesToPost(postId, categoryNames);
    } catch (error) {
      throw new Error(`Failed to replace post categories: ${error.message}`);
    }
  }
  
  /**
   * Replace post tags (remove old, add new)
   */
  static async replacePostTags(postId, tagNames) {
    try {
      // Remove existing tags
      const existingTags = await this.getPostTags(postId);
      for (const tag of existingTags) {
        await TermRelationship.removeCategoryFromPost(postId, tag._id);
      }
      
      // Add new tags
      await this.assignTagsToPost(postId, tagNames);
    } catch (error) {
      throw new Error(`Failed to replace post tags: ${error.message}`);
    }
  }
  
  /**
   * Increment view count for a post
   */
  static async incrementViewCount(postId) {
    try {
      // Try ObjectId update first (production)
      let post = await Post.findByIdAndUpdate(
        postId,
        { $inc: { view_count: 1 } },
        { new: true }
      );

      // Fallback: string _id (local dev after non-EJSON import)
      if (!post) {
        const result = await Post.collection.findOneAndUpdate(
          { _id: postId },
          { $inc: { view_count: 1 } },
          { returnDocument: 'after' }
        );
        post = result;
      }

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    } catch (error) {
      throw new Error(`Failed to increment view count: ${error.message}`);
    }
  }
  
  /**
   * Get post statistics
   */
  static async getPostStats(postId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Get comment count
      const commentCount = await Comment.countDocuments({
        comment_post_ID: postId,
        comment_approved: '1'
      });
      
      // Get meta data for additional stats
      const metaData = await PostMeta.find({ post_id: postId });
      const meta = {};
      metaData.forEach(item => {
        meta[item.meta_key] = item.meta_value;
      });
      
      return {
        view_count: post.view_count || 0,
        comment_count: commentCount,
        like_count: post.like_count || 0,
        share_count: meta.share_count || 0,
        published_date: post.post_date,
        modified_date: post.post_modified,
        author: post.post_author,
        status: post.post_status
      };
    } catch (error) {
      throw new Error(`Failed to get post stats: ${error.message}`);
    }
  }
}

module.exports = WordPressBlogService;
