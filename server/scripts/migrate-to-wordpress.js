const mongoose = require('mongoose');
const connectDB = require('../../config/db');
const WordPressBlogService = require('../../models/wordpress/WordPressBlogService');
const Blog = require('../../models/Blog'); // Old blog model
const User = require('../../models/User');

const migrateBlogsToWordPress = async () => {
  try {
    console.log('🔄 Starting migration from old blog system to WordPress-style system...');
    
    // Connect to database
    await connectDB();
    
    // Get all existing blogs
    const oldBlogs = await Blog.find({}).populate('user', 'firstName lastName');
    console.log(`📊 Found ${oldBlogs.length} existing blogs to migrate`);
    
    if (oldBlogs.length === 0) {
      console.log('ℹ️ No existing blogs found. Nothing to migrate.');
      return;
    }
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const oldBlog of oldBlogs) {
      try {
        console.log(`\n🔄 Migrating: "${oldBlog.title}"`);
        
        // Map old blog data to new WordPress-style structure
        const postData = {
          title: oldBlog.title,
          content: oldBlog.content,
          excerpt: oldBlog.content ? oldBlog.content.substring(0, 150) + '...' : '',
          status: 'publish', // Assume all old blogs were published
          comment_status: 'open',
          featured_image: oldBlog.featuredImage || 'no-image.jpg'
        };
        
        // Map categories (convert old enum categories to new system)
        const categories = oldBlog.category ? [oldBlog.category] : ['Other'];
        
        // Generate tags based on content and category
        const tags = [];
        if (oldBlog.category) {
          // Convert category to tag format
          const categoryTag = oldBlog.category.toLowerCase().replace(/\s+/g, '-');
          tags.push(categoryTag);
        }
        
        // Add some default tags based on content analysis
        const content = oldBlog.content ? oldBlog.content.toLowerCase() : '';
        if (content.includes('university') || content.includes('study')) tags.push('university');
        if (content.includes('china') || content.includes('chinese')) tags.push('china');
        if (content.includes('student')) tags.push('student-life');
        if (content.includes('experience')) tags.push('experience');
        if (content.includes('culture')) tags.push('culture');
        if (content.includes('food')) tags.push('food');
        if (content.includes('travel')) tags.push('travel');
        
        // Create meta data
        const meta = {
          original_blog_id: oldBlog._id.toString(),
          migration_date: new Date().toISOString(),
          original_created_date: oldBlog.createdAt,
          like_count: oldBlog.likes ? oldBlog.likes.length : 0,
          comment_count: oldBlog.comments ? oldBlog.comments.length : 0
        };
        
        // Create the new post
        const newPost = await WordPressBlogService.createPost(
          postData,
          oldBlog.user._id,
          categories,
          [...new Set(tags)], // Remove duplicates
          meta
        );
        
        // Migrate comments if they exist
        if (oldBlog.comments && oldBlog.comments.length > 0) {
          console.log(`   💬 Migrating ${oldBlog.comments.length} comments...`);
          
          for (const oldComment of oldBlog.comments) {
            try {
              const commentData = {
                author_name: oldComment.name || 'Anonymous',
                author_email: 'migrated@example.com', // Default email for migrated comments
                content: oldComment.text,
                user_id: oldComment.user || null
              };
              
              await WordPressBlogService.addComment(newPost._id, commentData);
            } catch (commentError) {
              console.log(`     ❌ Failed to migrate comment: ${commentError.message}`);
            }
          }
        }
        
        console.log(`   ✅ Successfully migrated to new post ID: ${newPost._id}`);
        migratedCount++;
        
      } catch (blogError) {
        console.log(`   ❌ Failed to migrate blog "${oldBlog.title}": ${blogError.message}`);
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${migratedCount} blogs`);
    console.log(`   ❌ Failed migrations: ${errorCount} blogs`);
    console.log(`   📊 Total processed: ${oldBlogs.length} blogs`);
    
    if (migratedCount > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Test the new WordPress-style API endpoints');
      console.log('   2. Update your frontend to use /api/wp-posts instead of /api/blogs');
      console.log('   3. Verify all data migrated correctly');
      console.log('   4. Consider backing up and removing old blog collection if everything works');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run migration
migrateBlogsToWordPress();
