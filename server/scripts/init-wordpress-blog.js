const mongoose = require('mongoose');
const connectDB = require('../../config/db');
const WordPressBlogService = require('../../models/wordpress/WordPressBlogService');
const User = require('../../models/User');

const initializeWordPressSystem = async () => {
  try {
    console.log('🚀 Initializing WordPress-style Blog System...');
    
    // Connect to database
    await connectDB();
    
    // Get a user to assign as author
    let user = await User.findOne();
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }
    
    console.log(`✅ Found user: ${user.firstName} ${user.lastName}`);
    
    // 1. Create default categories
    console.log('\n📂 Creating default categories...');
    const defaultCategories = [
      { name: 'Academic Life', description: 'Posts about academic experiences and studies' },
      { name: 'Cultural Experiences', description: 'Cultural insights and experiences in China' },
      { name: 'Travel', description: 'Travel experiences and destinations' },
      { name: 'Personal Development', description: 'Personal growth and development stories' },
      { name: 'News', description: 'Latest news and updates' },
      { name: 'Tips & Advice', description: 'Helpful tips and advice for students' }
    ];
    
    for (const categoryData of defaultCategories) {
      await WordPressBlogService.createCategory(categoryData.name, categoryData.description);
      console.log(`   ✅ Created category: ${categoryData.name}`);
    }
    
    // 2. Create default tags
    console.log('\n🏷️ Creating default tags...');
    const defaultTags = [
      'student-life',
      'china',
      'university',
      'scholarship',
      'language-learning',
      'culture',
      'food',
      'travel',
      'tips',
      'experience',
      'study-abroad',
      'international-students'
    ];
    
    for (const tagName of defaultTags) {
      await WordPressBlogService.createTag(tagName);
      console.log(`   ✅ Created tag: ${tagName}`);
    }
    
    // 3. Create sample posts
    console.log('\n📝 Creating sample blog posts...');
    
    const samplePosts = [
      {
        postData: {
          title: 'My First Year in Beijing: A Journey of Discovery',
          content: `
            <p>Starting university in Beijing was both exciting and overwhelming. As a Congolese student, I knew this journey would challenge me in ways I had never imagined.</p>
            
            <h3>The Initial Culture Shock</h3>
            <p>The first few weeks were the hardest. Everything from the language barrier to the food was completely different from home. I remember my first trip to the cafeteria - I pointed at random dishes, not knowing what I was ordering!</p>
            
            <h3>Finding My Community</h3>
            <p>The turning point came when I discovered the Association of Congolese Students in China (AECC). Suddenly, I wasn't alone anymore. Meeting other students who shared similar experiences made all the difference.</p>
            
            <h3>Academic Challenges and Growth</h3>
            <p>The academic system here is quite different from what I was used to. The emphasis on group work and practical applications really helped me develop new skills. My professors were patient and understanding of the challenges international students face.</p>
            
            <h3>Language Learning Journey</h3>
            <p>Learning Mandarin has been one of the most rewarding aspects of my time here. From struggling to order food to having deep conversations with local friends, the progress has been incredible.</p>
            
            <p>Looking back at this first year, I'm amazed at how much I've grown. Beijing has become my second home, and I'm excited for what the future holds.</p>
          `,
          excerpt: 'A personal reflection on the challenges and triumphs of being a Congolese student in Beijing during my first year at university.',
          status: 'publish',
          featured_image: 'beijing-university-life.jpg'
        },
        categories: ['Academic Life', 'Personal Development'],
        tags: ['student-life', 'beijing', 'university', 'experience', 'international-students'],
        meta: {
          reading_difficulty: 'easy',
          target_audience: 'new_students',
          featured_post: 'yes'
        }
      },
      {
        postData: {
          title: 'Navigating Shanghai as an International Student: Tips and Insights',
          content: `
            <p>Shanghai is a vibrant, international city that offers incredible opportunities for students. Here are some essential tips I've learned during my time here.</p>
            
            <h3>Transportation Made Easy</h3>
            <p>The Shanghai Metro system is your best friend. Get a transportation card and download the Metro app - it will save you time and money. The city is incredibly well-connected.</p>
            
            <h3>Finding Affordable Food</h3>
            <p>While Shanghai can be expensive, there are plenty of affordable eating options:</p>
            <ul>
              <li>University cafeterias offer cheap, filling meals</li>
              <li>Local wet markets have fresh ingredients at great prices</li>
              <li>Street food vendors provide authentic local flavors</li>
              <li>African restaurants in Yangpu district offer a taste of home</li>
            </ul>
            
            <h3>Banking and Money Management</h3>
            <p>Open a local bank account as soon as possible. Most international students use Bank of China or ICBC. WeChat Pay and Alipay are essential for daily transactions.</p>
            
            <h3>Shopping Districts</h3>
            <p>For affordable shopping, check out:</p>
            <ul>
              <li>Qipu Road Market for clothes</li>
              <li>Taobao for online shopping</li>
              <li>Local supermarkets like Carrefour and Walmart</li>
            </ul>
            
            <h3>Healthcare</h3>
            <p>Register with your university's medical center. For serious issues, international hospitals like Parkway Health provide English-speaking services.</p>
            
            <p>Shanghai is an amazing city for international students. With proper preparation and an open mind, you'll have an unforgettable experience here!</p>
          `,
          excerpt: 'Essential tips and insights for international students living in Shanghai, covering transportation, food, banking, shopping, and healthcare.',
          status: 'publish',
          featured_image: 'shanghai-student-guide.jpg'
        },
        categories: ['Tips & Advice', 'Cultural Experiences'],
        tags: ['shanghai', 'tips', 'student-life', 'city-guide', 'international-students'],
        meta: {
          reading_difficulty: 'medium',
          target_audience: 'all_students',
          post_views: '156'
        }
      },
      {
        postData: {
          title: 'Mastering Chinese Cuisine: A Student\'s Culinary Adventure',
          content: `
            <p>When I first arrived in China, I was intimidated by the vast array of unfamiliar foods. Today, I'm passionate about Chinese cuisine and love exploring regional specialties.</p>
            
            <h3>Starting with the Basics</h3>
            <p>My culinary journey began with simple dishes like fried rice and noodle soups. The university cafeteria was my training ground, where I learned to identify ingredients and flavors.</p>
            
            <h3>Regional Discoveries</h3>
            <p>China's regional cuisines are incredibly diverse:</p>
            <ul>
              <li><strong>Sichuan:</strong> Spicy, numbing flavors with lots of chili and Sichuan peppercorns</li>
              <li><strong>Cantonese:</strong> Fresh, delicate flavors with emphasis on seafood</li>
              <li><strong>Beijing:</strong> Hearty dishes like Peking duck and jianbing</li>
              <li><strong>Hunan:</strong> Spicy and sour combinations</li>
            </ul>
            
            <h3>Cooking Adventures</h3>
            <p>Learning to cook Chinese food has been incredibly rewarding. I started with simple stir-fries and gradually worked my way up to more complex dishes. YouTube cooking channels and patient Chinese friends have been invaluable teachers.</p>
            
            <h3>Fusion Experiments</h3>
            <p>One of my favorite discoveries has been creating fusion dishes that combine Chinese techniques with Congolese flavors. Imagine Chinese-style stir-fried cassava leaves or kung pao chicken with African spices!</p>
            
            <h3>Food as Cultural Bridge</h3>
            <p>Sharing meals has been one of the best ways to connect with local students. Food transcends language barriers and creates lasting friendships.</p>
            
            <p>My advice to new students: be adventurous with food! Try everything at least once, and don't be afraid to ask questions. Chinese people love sharing their food culture with curious international students.</p>
          `,
          excerpt: 'A student\'s journey of discovering and mastering Chinese cuisine, from cafeteria basics to regional specialties and fusion experiments.',
          status: 'publish',
          featured_image: 'chinese-cuisine-student.jpg'
        },
        categories: ['Cultural Experiences', 'Personal Development'],
        tags: ['food', 'culture', 'cooking', 'experience', 'cultural-exchange'],
        meta: {
          reading_difficulty: 'easy',
          target_audience: 'all_students',
          recipe_included: 'yes'
        }
      }
    ];
    
    for (const postInfo of samplePosts) {
      const post = await WordPressBlogService.createPost(
        postInfo.postData,
        user._id,
        postInfo.categories,
        postInfo.tags,
        postInfo.meta
      );
      console.log(`   ✅ Created post: ${post.post_title}`);
    }
    
    // 4. Display summary
    console.log('\n📊 WordPress System Initialization Summary:');
    console.log(`   📂 Categories: ${defaultCategories.length} created`);
    console.log(`   🏷️ Tags: ${defaultTags.length} created`);
    console.log(`   📝 Posts: ${samplePosts.length} created`);
    
    console.log('\n✅ WordPress-style blog system initialized successfully!');
    console.log('\n🔗 Available API endpoints:');
    console.log('   GET    /api/wp-posts                    - Get all posts');
    console.log('   GET    /api/wp-posts/:id               - Get single post');
    console.log('   POST   /api/wp-posts                   - Create new post');
    console.log('   PUT    /api/wp-posts/:id               - Update post');
    console.log('   DELETE /api/wp-posts/:id               - Delete post');
    console.log('   GET    /api/wp-posts/categories/all    - Get all categories');
    console.log('   GET    /api/wp-posts/tags/all          - Get all tags');
    console.log('   POST   /api/wp-posts/:id/comments      - Add comment');
    console.log('   GET    /api/wp-posts/:id/comments      - Get comments');
    
  } catch (error) {
    console.error('❌ Error initializing WordPress system:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

initializeWordPressSystem();
