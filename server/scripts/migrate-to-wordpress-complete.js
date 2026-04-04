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
    console.log('🔄 Starting migration to WordPress-style blog system...');
    
    // Connect to database
    await connectDB();
    
    // Step 1: Initialize WordPress system
    console.log('\n📦 Initializing WordPress system...');
    await initializeWordPressSystem();
    
    // Step 2: Migrate existing blogs
    console.log('\n📊 Migrating existing blogs...');
    await migrateExistingBlogs();
    
    // Step 3: Clean up old data (optional - keep for backup)
    console.log('\n🧹 Migration completed successfully!');
    console.log('💡 Old blog data has been preserved in "blogs" collection for backup.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit();
  }
};

const initializeWordPressSystem = async () => {
  try {
    // Create default categories
    const defaultCategories = [
      'Academic Life',
      'Cultural Experiences', 
      'Travel',
      'Personal Development',
      'News',
      'Uncategorized'
    ];
    
    for (const categoryName of defaultCategories) {
      try {
        await WordPressBlogService.createCategory(categoryName, {
          description: `Posts about ${categoryName.toLowerCase()}`,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-')
        });
        console.log(`✅ Created category: ${categoryName}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Category already exists: ${categoryName}`);
        } else {
          console.error(`❌ Failed to create category ${categoryName}:`, error.message);
        }
      }
    }
    
    // Create default tags
    const defaultTags = [
      'student-life',
      'china-experience',
      'tips',
      'guide',
      'culture',
      'education',
      'lifestyle'
    ];
    
    for (const tagName of defaultTags) {
      try {
        await WordPressBlogService.createTag(tagName, {
          description: `Posts tagged with ${tagName}`,
          slug: tagName
        });
        console.log(`✅ Created tag: ${tagName}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Tag already exists: ${tagName}`);
        } else {
          console.error(`❌ Failed to create tag ${tagName}:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('Failed to initialize WordPress system:', error);
    throw error;
  }
};

const migrateExistingBlogs = async () => {
  try {
    // Get all existing blogs
    const oldBlogs = await OldBlog.find({}).populate('user', 'firstName lastName');
    console.log(`📊 Found ${oldBlogs.length} existing blogs to migrate`);
    
    if (oldBlogs.length === 0) {
      console.log('ℹ️  No existing blogs to migrate');
      return;
    }
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const oldBlog of oldBlogs) {
      try {
        // Prepare post data
        const postData = {
          title: oldBlog.title,
          content: oldBlog.content,
          excerpt: generateExcerpt(oldBlog.content),
          status: 'publish',
          comment_status: 'open',
          featured_image: oldBlog.featuredImage !== 'no-image.jpg' ? oldBlog.featuredImage : null
        };
        
        // Determine categories
        const categories = oldBlog.category ? [oldBlog.category] : ['Uncategorized'];
        
        // Generate tags based on content (simple keyword extraction)
        const tags = extractTags(oldBlog.content, oldBlog.title);
        
        // Prepare metadata
        const meta = {
          old_blog_id: oldBlog._id.toString(),
          migrated_at: new Date(),
          original_created_at: oldBlog.createdAt,
          like_count: oldBlog.likes ? oldBlog.likes.length : 0,
          comment_count: oldBlog.comments ? oldBlog.comments.length : 0
        };
        
        // Create the WordPress post
        const newPost = await WordPressBlogService.createPost(
          postData,
          oldBlog.user._id,
          categories,
          tags,
          meta
        );
        
        // Migrate comments if they exist
        if (oldBlog.comments && oldBlog.comments.length > 0) {
          for (const comment of oldBlog.comments) {
            try {
              await WordPressBlogService.addComment(newPost._id, {
                content: comment.text,
                author_id: comment.user,
                author_name: comment.name || 'Anonymous',
                author_email: '',
                comment_date: comment.date || oldBlog.createdAt
              });
            } catch (commentError) {
              console.warn(`⚠️  Failed to migrate comment for post ${oldBlog.title}:`, commentError.message);
            }
          }
        }
        
        migratedCount++;
        console.log(`✅ Migrated blog: "${oldBlog.title}" (${migratedCount}/${oldBlogs.length})`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to migrate blog "${oldBlog.title}":`, error.message);
      }
    }
    
    console.log(`\n📈 Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${migratedCount} blogs`);
    console.log(`   ❌ Failed: ${errorCount} blogs`);
    console.log(`   📊 Total: ${oldBlogs.length} blogs`);
    
  } catch (error) {
    console.error('Failed to migrate existing blogs:', error);
    throw error;
  }
};

// Helper function to generate excerpt from content
const generateExcerpt = (content, length = 150) => {
  if (!content) return '';
  
  // Remove HTML tags
  const textContent = content.replace(/<[^>]*>/g, '');
  
  if (textContent.length <= length) {
    return textContent;
  }
  
  return textContent.substring(0, length).trim() + '...';
};

// Helper function to extract tags from content
const extractTags = (content, title) => {
  const tags = [];
  const text = `${title} ${content}`.toLowerCase();
  
  // Simple keyword matching
  const keywords = {
    'student-life': ['student', 'study', 'university', 'college', 'academic'],
    'china-experience': ['china', 'chinese', 'beijing', 'shanghai', 'guangzhou'],
    'culture': ['culture', 'cultural', 'tradition', 'festival', 'celebration'],
    'tips': ['tip', 'advice', 'guide', 'how', 'help'],
    'education': ['education', 'learning', 'research', 'degree', 'graduation'],
    'lifestyle': ['life', 'living', 'daily', 'routine', 'experience']
  };
  
  for (const [tag, keywordList] of Object.entries(keywords)) {
    if (keywordList.some(keyword => text.includes(keyword))) {
      tags.push(tag);
    }
  }
  
  return tags.slice(0, 5); // Limit to 5 tags
};

// Run migration
if (require.main === module) {
  migrateToWordPressBlogSystem();
}

module.exports = { migrateToWordPressBlogSystem };
