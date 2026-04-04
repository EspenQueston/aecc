/**
 * Complete WordPress Blog System Migration Script
 * This script initializes the WordPress-style blog management system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// WordPress Models
const Post = require('../models/wordpress/Post');
const PostMeta = require('../models/wordpress/PostMeta');
const Term = require('../models/wordpress/Term');
const TermTaxonomy = require('../models/wordpress/TermTaxonomy');
const TermRelationship = require('../models/wordpress/TermRelationship');
const Comment = require('../models/wordpress/Comment');
const CommentMeta = require('../models/wordpress/CommentMeta');
const User = require('../models/User');

// Initialize WordPress Blog System
async function initializeWordPressSystem() {
  try {
    console.log('🚀 Starting WordPress Blog System Migration...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Step 1: Create default categories
    console.log('\n📁 Creating default categories...');
    await createDefaultCategories();
    
    // Step 2: Create default tags
    console.log('\n🏷️  Creating default tags...');
    await createDefaultTags();
    
    // Step 3: Create indexes for better performance
    console.log('\n🔍 Creating database indexes...');
    await createDatabaseIndexes();
    
    // Step 4: Migrate existing data (if any old blog system exists)
    console.log('\n🔄 Checking for existing data to migrate...');
    await migrateExistingData();
    
    // Step 5: Create sample blog posts
    console.log('\n📝 Creating sample blog posts...');
    await createSamplePosts();
    
    console.log('\n✅ WordPress Blog System Migration completed successfully!');
    console.log('\n📊 System Statistics:');
    await displaySystemStats();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

/**
 * Create default blog categories
 */
async function createDefaultCategories() {
  const categories = [
    { name: 'Academic Life', description: 'Posts about academic experiences, study tips, and university life' },
    { name: 'Cultural Experiences', description: 'Stories about cultural exchange and adaptation' },
    { name: 'Travel', description: 'Travel experiences and tips within China and beyond' },
    { name: 'Personal Development', description: 'Self-improvement, skills, and personal growth' },
    { name: 'News', description: 'Latest news and updates about the association' },
    { name: 'Career', description: 'Career advice, internships, and job opportunities' },
    { name: 'Technology', description: 'Tech tips, digital tools, and innovation' },
    { name: 'Language Learning', description: 'Chinese language learning tips and resources' },
    { name: 'Food & Lifestyle', description: 'Chinese cuisine, lifestyle, and daily life tips' },
    { name: 'Events', description: 'Association events and community activities' }
  ];

  for (const categoryData of categories) {
    try {
      // Create term
      let term = await Term.findOne({ name: categoryData.name });
      if (!term) {
        term = new Term({
          name: categoryData.name,
          slug: categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        });
        await term.save();
        console.log(`   ✅ Created term: ${categoryData.name}`);
      }

      // Create term taxonomy
      let termTaxonomy = await TermTaxonomy.findOne({ 
        term_id: term._id, 
        taxonomy: 'category' 
      });
      
      if (!termTaxonomy) {
        termTaxonomy = new TermTaxonomy({
          term_id: term._id,
          taxonomy: 'category',
          description: categoryData.description,
          count: 0
        });
        await termTaxonomy.save();
        console.log(`   ✅ Created category: ${categoryData.name}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Category ${categoryData.name} might already exist`);
    }
  }
}

/**
 * Create default tags
 */
async function createDefaultTags() {
  const tags = [
    'student-life', 'china', 'education', 'culture', 'travel', 'tips', 
    'community', 'language', 'technology', 'career', 'scholarship',
    'university', 'beijing', 'shanghai', 'guangzhou', 'study-abroad',
    'personal-growth', 'networking', 'events', 'workshop'
  ];

  for (const tagName of tags) {
    try {
      // Create term
      let term = await Term.findOne({ name: tagName });
      if (!term) {
        term = new Term({
          name: tagName,
          slug: tagName.toLowerCase()
        });
        await term.save();
      }

      // Create term taxonomy
      let termTaxonomy = await TermTaxonomy.findOne({ 
        term_id: term._id, 
        taxonomy: 'post_tag' 
      });
      
      if (!termTaxonomy) {
        termTaxonomy = new TermTaxonomy({
          term_id: term._id,
          taxonomy: 'post_tag',
          count: 0
        });
        await termTaxonomy.save();
        console.log(`   ✅ Created tag: ${tagName}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Tag ${tagName} might already exist`);
    }
  }
}

/**
 * Create database indexes for optimal performance
 */
async function createDatabaseIndexes() {
  try {
    // Post indexes
    await Post.collection.createIndex({ post_type: 1, post_status: 1, post_date: -1 });
    await Post.collection.createIndex({ post_author: 1 });
    await Post.collection.createIndex({ post_name: 1 });
    await Post.collection.createIndex({ post_date: -1 });
    console.log('   ✅ Created Post indexes');

    // Term indexes
    await Term.collection.createIndex({ slug: 1 }, { unique: true });
    await Term.collection.createIndex({ name: 1 });
    console.log('   ✅ Created Term indexes');

    // TermTaxonomy indexes
    await TermTaxonomy.collection.createIndex({ term_id: 1, taxonomy: 1 }, { unique: true });
    await TermTaxonomy.collection.createIndex({ taxonomy: 1 });
    console.log('   ✅ Created TermTaxonomy indexes');

    // TermRelationship indexes
    await TermRelationship.collection.createIndex({ object_id: 1 });
    await TermRelationship.collection.createIndex({ term_taxonomy_id: 1 });
    console.log('   ✅ Created TermRelationship indexes');

    // Comment indexes
    await Comment.collection.createIndex({ comment_post_ID: 1 });
    await Comment.collection.createIndex({ comment_date: -1 });
    console.log('   ✅ Created Comment indexes');

    // PostMeta indexes
    await PostMeta.collection.createIndex({ post_id: 1 });
    await PostMeta.collection.createIndex({ meta_key: 1 });
    console.log('   ✅ Created PostMeta indexes');
  } catch (error) {
    console.log('   ⚠️  Some indexes might already exist');
  }
}

/**
 * Migrate existing data from old blog system (if any)
 */
async function migrateExistingData() {
  try {
    // Check if there's an old Blog collection to migrate
    const collections = await mongoose.connection.db.listCollections().toArray();
    const blogCollection = collections.find(col => col.name === 'blogs');
    
    if (blogCollection) {
      console.log('   📦 Found existing blog data to migrate...');
      const oldBlogs = await mongoose.connection.db.collection('blogs').find({}).toArray();
      
      for (const oldBlog of oldBlogs) {
        try {
          // Check if already migrated
          const existingPost = await Post.findOne({ 
            post_title: oldBlog.title,
            post_author: oldBlog.user 
          });
          
          if (!existingPost) {
            const newPost = new Post({
              post_author: oldBlog.user,
              post_title: oldBlog.title,
              post_content: oldBlog.content,
              post_status: 'publish',
              post_type: 'post',
              featured_image: oldBlog.featuredImage || 'no-image.jpg',
              post_date: oldBlog.createdAt || new Date(),
              like_count: oldBlog.likes ? oldBlog.likes.length : 0,
              comment_count: oldBlog.comments ? oldBlog.comments.length : 0
            });
            
            await newPost.save();
            
            // Assign category if exists
            if (oldBlog.category) {
              const categoryTerm = await Term.findOne({ name: oldBlog.category });
              if (categoryTerm) {
                const categoryTaxonomy = await TermTaxonomy.findOne({ 
                  term_id: categoryTerm._id, 
                  taxonomy: 'category' 
                });
                if (categoryTaxonomy) {
                  const relationship = new TermRelationship({
                    object_id: newPost._id,
                    term_taxonomy_id: categoryTaxonomy._id
                  });
                  await relationship.save();
                }
              }
            }
            
            console.log(`   ✅ Migrated: ${oldBlog.title}`);
          }
        } catch (error) {
          console.log(`   ⚠️  Failed to migrate: ${oldBlog.title}`);
        }
      }
    } else {
      console.log('   ℹ️  No existing blog data found to migrate');
    }
  } catch (error) {
    console.log('   ⚠️  Error during migration check:', error.message);
  }
}

/**
 * Create sample blog posts
 */
async function createSamplePosts() {
  try {
    // Get a user to author the posts
    const users = await User.find().limit(1);
    if (users.length === 0) {
      console.log('   ⚠️  No users found to create sample posts');
      return;
    }
    
    const authorId = users[0]._id;

    const samplePosts = [
      {
        title: 'Welcome to Our New Blog System',
        content: `
          <p>We're excited to introduce our new WordPress-inspired blog management system! This system provides a more robust and flexible platform for sharing stories, experiences, and insights from our community.</p>
          
          <h3>What's New?</h3>
          <ul>
            <li>Better content organization with categories and tags</li>
            <li>Enhanced commenting system</li>
            <li>Improved search and filtering capabilities</li>
            <li>Mobile-responsive design</li>
            <li>SEO-friendly URLs and meta data</li>
          </ul>
          
          <p>We encourage all members to share their experiences studying in China, cultural insights, travel adventures, and academic achievements.</p>
        `,
        excerpt: 'Introducing our new WordPress-inspired blog management system with enhanced features for better content organization and user experience.',
        category: 'News',
        tags: ['community', 'technology']
      },
      {
        title: 'Study Tips for International Students in China',
        content: `
          <p>Studying in China as an international student presents unique opportunities and challenges. Here are some practical tips to help you succeed academically and personally.</p>
          
          <h3>Academic Success</h3>
          <ul>
            <li>Learn basic Chinese characters to understand textbooks better</li>
            <li>Form study groups with local students</li>
            <li>Utilize university resources and libraries</li>
            <li>Communicate regularly with professors during office hours</li>
          </ul>
          
          <h3>Cultural Integration</h3>
          <p>Embracing Chinese culture while maintaining your own identity is key to a fulfilling study abroad experience.</p>
        `,
        excerpt: 'Essential study tips and cultural integration advice for international students pursuing their education in China.',
        category: 'Academic Life',
        tags: ['study-abroad', 'tips', 'education']
      },
      {
        title: 'Exploring Beijing: A Student\'s Guide',
        content: `
          <p>Beijing, China's capital, offers countless opportunities for exploration and cultural immersion. As students, we have unique access to both historical sites and modern attractions.</p>
          
          <h3>Must-Visit Historical Sites</h3>
          <ul>
            <li>The Forbidden City - Imperial palace complex</li>
            <li>Great Wall of China - Multiple sections accessible from Beijing</li>
            <li>Temple of Heaven - Beautiful imperial temple</li>
            <li>Summer Palace - Imperial garden</li>
          </ul>
          
          <h3>Student-Friendly Areas</h3>
          <p>Wudaokou, known as the "Universe Center," is perfect for international students with its diverse food options and vibrant nightlife.</p>
        `,
        excerpt: 'A comprehensive guide to exploring Beijing as an international student, featuring must-visit sites and student-friendly areas.',
        category: 'Travel',
        tags: ['beijing', 'travel', 'culture']
      }
    ];

    for (const postData of samplePosts) {
      try {
        // Check if post already exists
        const existingPost = await Post.findOne({ post_title: postData.title });
        if (!existingPost) {
          const post = new Post({
            post_author: authorId,
            post_title: postData.title,
            post_content: postData.content,
            post_excerpt: postData.excerpt,
            post_status: 'publish',
            post_type: 'post',
            featured_image: 'no-image.jpg'
          });
          
          await post.save();
          
          // Assign category
          const categoryTerm = await Term.findOne({ name: postData.category });
          if (categoryTerm) {
            const categoryTaxonomy = await TermTaxonomy.findOne({ 
              term_id: categoryTerm._id, 
              taxonomy: 'category' 
            });
            if (categoryTaxonomy) {
              const relationship = new TermRelationship({
                object_id: post._id,
                term_taxonomy_id: categoryTaxonomy._id
              });
              await relationship.save();
              
              // Update category count
              categoryTaxonomy.count += 1;
              await categoryTaxonomy.save();
            }
          }
          
          // Assign tags
          for (const tagName of postData.tags) {
            const tagTerm = await Term.findOne({ name: tagName });
            if (tagTerm) {
              const tagTaxonomy = await TermTaxonomy.findOne({ 
                term_id: tagTerm._id, 
                taxonomy: 'post_tag' 
              });
              if (tagTaxonomy) {
                const relationship = new TermRelationship({
                  object_id: post._id,
                  term_taxonomy_id: tagTaxonomy._id
                });
                await relationship.save();
                
                // Update tag count
                tagTaxonomy.count += 1;
                await tagTaxonomy.save();
              }
            }
          }
          
          console.log(`   ✅ Created sample post: ${postData.title}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Failed to create sample post: ${postData.title}`);
      }
    }
  } catch (error) {
    console.log('   ⚠️  Error creating sample posts:', error.message);
  }
}

/**
 * Display system statistics
 */
async function displaySystemStats() {
  try {
    const postsCount = await Post.countDocuments({ post_type: 'post' });
    const publishedPostsCount = await Post.countDocuments({ post_type: 'post', post_status: 'publish' });
    const categoriesCount = await TermTaxonomy.countDocuments({ taxonomy: 'category' });
    const tagsCount = await TermTaxonomy.countDocuments({ taxonomy: 'post_tag' });
    const commentsCount = await Comment.countDocuments();
    
    console.log(`   📝 Total Posts: ${postsCount}`);
    console.log(`   📄 Published Posts: ${publishedPostsCount}`);
    console.log(`   📁 Categories: ${categoriesCount}`);
    console.log(`   🏷️  Tags: ${tagsCount}`);
    console.log(`   💬 Comments: ${commentsCount}`);
  } catch (error) {
    console.log('   ⚠️  Error getting statistics:', error.message);
  }
}

// Run the migration
if (require.main === module) {
  initializeWordPressSystem();
}

module.exports = { initializeWordPressSystem };
