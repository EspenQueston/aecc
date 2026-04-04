const mongoose = require('mongoose');
const Comment = require('../models/wordpress/Comment');
const Post = require('../models/wordpress/Post');
const connectDB = require('../config/db');

// Sample comment data
const sampleComments = [
    {
        author: "Marie Kabila",
        email: "marie.kabila@student.edu.cn",
        content: "This article is very insightful! Thank you for sharing your experience. As a fellow Congolese student in China, I can relate to many of the challenges mentioned here. Keep up the great work!",
        approved: "1"
    },
    {
        author: "Pierre Mobutu",
        email: "pierre.mobutu@university.cn",
        content: "Excellent post! The tips about cultural adaptation are particularly helpful. I've been struggling with some of these issues and your advice gives me hope.",
        approved: "1"
    },
    {
        author: "Grace Lumumba",
        email: "grace.lumumba@gmail.com",
        content: "Thank you for writing this. It's encouraging to see our community supporting each other. I would love to see more posts about academic opportunities.",
        approved: "1"
    },
    {
        author: "Jean-Claude Kasongo",
        email: "jc.kasongo@student.edu.cn",
        content: "Very well written! This information will be very useful for new students arriving in China. Could you also write about scholarship opportunities?",
        approved: "1"
    },
    {
        author: "Fatou Mwamba",
        email: "fatou.mwamba@university.cn",
        content: "Great article! As someone who has been in China for 3 years, I can confirm that these experiences are very common among our community. Thanks for sharing!",
        approved: "1"
    },
    {
        author: "David Tshisekedi",
        email: "david.tshisekedi@gmail.com",
        content: "This is exactly what I needed to read today. The section about networking is particularly valuable. Thank you for taking the time to write this.",
        approved: "1"
    },
    {
        author: "Ange Mukendi",
        email: "ange.mukendi@student.edu.cn",
        content: "Wonderful post! Your experiences mirror my own journey. It's amazing how we can support each other through these shared stories.",
        approved: "1"
    },
    {
        author: "Paul Katumbi",
        email: "paul.katumbi@university.cn",
        content: "Thank you for this comprehensive guide. The practical tips are very helpful, especially for those of us just starting our journey in China.",
        approved: "1"
    },
    {
        author: "Christine Mulumba",
        email: "christine.mulumba@gmail.com",
        content: "This article resonates with me deeply. The challenges you've outlined are very real, but your positive approach is inspiring. Keep writing!",
        approved: "1"
    },
    {
        author: "Emmanuel Kapanga",
        email: "emmanuel.kapanga@student.edu.cn",
        content: "Excellent work! Your insights about balancing studies and cultural integration are spot on. This will help many students in our community.",
        approved: "1"
    },
    {
        author: "Beatrice Ngozi",
        email: "beatrice.ngozi@university.cn",
        content: "I appreciate you sharing your journey. The honesty about the difficulties makes it more relatable. Looking forward to more posts like this!",
        approved: "1"
    },
    {
        author: "Joseph Ilunga",
        email: "joseph.ilunga@gmail.com",
        content: "This is a must-read for every Congolese student in China! The advice is practical and the writing is engaging. Thank you for this valuable resource.",
        approved: "1"
    }
];

// Sample replies
const sampleReplies = [
    {
        author: "AECC Team",
        email: "admin@aecc.org",
        content: "Thank you for your kind words! We're glad this article was helpful to you.",
        approved: "1"
    },
    {
        author: "Marie Kabila",
        email: "marie.kabila@student.edu.cn",
        content: "I completely agree! Community support is so important for our success here.",
        approved: "1"
    },
    {
        author: "Student Support",
        email: "support@aecc.org",
        content: "Great suggestion! We'll definitely consider writing about scholarship opportunities in our next post.",
        approved: "1"
    },
    {
        author: "Pierre Mobutu",
        email: "pierre.mobutu@university.cn",
        content: "Thanks for sharing your perspective! It's always encouraging to hear from fellow students.",
        approved: "1"
    }
];

async function addSampleComments() {
    try {
        await connectDB();
        console.log('Connected to database');

        // Get all published posts
        const posts = await Post.find({ post_status: 'publish' }).limit(10);
        
        if (posts.length === 0) {
            console.log('No published posts found. Please add some blog posts first.');
            return;
        }

        console.log(`Found ${posts.length} posts to add comments to`);

        // Clear existing comments
        await Comment.deleteMany({});
        console.log('Cleared existing comments');

        let commentsAdded = 0;
        let repliesAdded = 0;

        for (const post of posts) {
            // Add 3-5 random comments per post
            const numComments = Math.floor(Math.random() * 3) + 3; // 3-5 comments
            const shuffledComments = [...sampleComments].sort(() => 0.5 - Math.random());
            
            for (let i = 0; i < numComments && i < shuffledComments.length; i++) {
                const commentData = shuffledComments[i];
                
                // Create random date within the last 30 days
                const randomDate = new Date();
                randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
                
                const comment = new Comment({
                    comment_post_ID: post._id,
                    comment_author: commentData.author,
                    comment_author_email: commentData.email,
                    comment_content: commentData.content,
                    comment_approved: commentData.approved,
                    comment_date: randomDate,
                    comment_date_gmt: randomDate,
                    comment_author_IP: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    comment_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    like_count: Math.floor(Math.random() * 15), // 0-14 likes
                    reply_count: 0
                });

                await comment.save();
                commentsAdded++;
                console.log(`Added comment by ${commentData.author} to post "${post.post_title}"`);

                // 40% chance to add a reply
                if (Math.random() < 0.4) {
                    const replyData = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
                    const replyDate = new Date(randomDate);
                    replyDate.setHours(replyDate.getHours() + Math.floor(Math.random() * 24)); // Reply within 24 hours
                    
                    const reply = new Comment({
                        comment_post_ID: post._id,
                        comment_author: replyData.author,
                        comment_author_email: replyData.email,
                        comment_content: replyData.content,
                        comment_approved: replyData.approved,
                        comment_date: replyDate,
                        comment_date_gmt: replyDate,
                        comment_parent: comment._id,
                        comment_author_IP: `192.168.1.${Math.floor(Math.random() * 255)}`,
                        comment_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        like_count: Math.floor(Math.random() * 8), // 0-7 likes for replies
                        reply_count: 0
                    });

                    await reply.save();
                    repliesAdded++;
                    
                    // Update parent comment reply count
                    await Comment.findByIdAndUpdate(comment._id, { $inc: { reply_count: 1 } });
                    
                    console.log(`Added reply by ${replyData.author} to comment by ${commentData.author}`);
                }
            }
        }

        console.log(`\n✅ Successfully added ${commentsAdded} comments and ${repliesAdded} replies to ${posts.length} posts`);
        console.log('Comments are now available for display on the blog-details pages');

    } catch (error) {
        console.error('Error adding sample comments:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the script
if (require.main === module) {
    addSampleComments();
}

module.exports = addSampleComments;
