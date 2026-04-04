# Congolese Students China - Database Documentation

## Overview

This project uses **MongoDB** as the primary database with **Mongoose** as the ODM (Object Document Mapper). The database is designed to manage a community platform for Congolese students studying in China.

## Database Information

- **Database Name**: `congolese-students-china`
- **Connection URI**: `mongodb://127.0.0.1:27017/congolese-students-china`
- **Technology Stack**: MongoDB + Mongoose + Node.js + Express

## Collections & Schemas

### 1. Users Collection (`users`)

The main user collection storing all registered students and administrators.

**Schema Fields:**

```javascript
{
  // Personal Information
  firstName: String (required),
  lastName: String (required),
  secondName: String (optional),
  dateOfBirth: Date (required),
  gender: String (enum: ['male', 'female', 'other'], required),
  passportNumber: String (unique, required, format: OA followed by 7 digits),
  phoneNumber: String (required),
  wechatId: String (required),
  province: String,
  city: String,
  lastEntryDate: Date (required),

  // Academic Information
  university: String (required),
  fieldOfStudy: String (required),
  degreeLevel: String (enum: ['bachelor', 'master', 'phd', 'language', 'other'], required),
  yearOfAdmission: Number,
  expectedGraduation: Date (required),
  scholarshipStatus: String (enum: ['yes', 'no'], required),
  scholarshipType: String (conditional required when scholarshipStatus = 'yes'),
  studentId: String,

  // File Uploads
  passportFile: String (file path),
  visaFile: String (file path),
  admissionFile: String (file path),

  // Account Information
  email: String (unique, required),
  password: String (required, hashed),
  role: String (enum: ['student', 'admin'], default: 'student'),
  createdAt: Date (default: now)
}
```

**Indexes:**
- `email` (unique)
- `passportNumber` (unique)
- `createdAt` (descending)

### 2. Profiles Collection (`profiles`)

Extended profile information for users with additional social and personal details.

**Schema Fields:**

```javascript
{
  user: ObjectId (ref: 'User', required),
  bio: String,
  university: String,
  fieldOfStudy: String,
  yearOfStudy: String,
  province: String,
  city: String,
  skills: [String],
  social: {
    wechat: String,
    whatsapp: String,
    telegram: String,
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  avatar: String (default: 'default-avatar.jpg'),
  createdAt: Date (default: now)
}
```

**Indexes:**
- `user` (unique reference to User)

### 3. Blogs Collection (`blogs`)

Blog posts created by users to share experiences and information.

**Schema Fields:**

```javascript
{
  title: String (required, max: 100 chars),
  content: String (required),
  category: String (enum: ['Academic Life', 'Cultural Experiences', 'Travel', 'Personal Development', 'News', 'Other'], required),
  featuredImage: String (default: 'no-image.jpg'),
  user: ObjectId (ref: 'User', required),
  comments: [{
    text: String (required),
    user: ObjectId (ref: 'User', required),
    name: String,
    date: Date (default: now)
  }],
  likes: [{
    user: ObjectId (ref: 'User')
  }],
  createdAt: Date (default: now)
}
```

**Indexes:**
- `category`
- `createdAt` (descending)
- `title` and `content` (text search)

### 4. Events Collection (`events`)

Community events and activities organized by students.

**Schema Fields:**

```javascript
{
  title: String (required, max: 100 chars),
  description: String (required),
  location: String (required),
  startDate: Date (required),
  endDate: Date (required),
  image: String (default: 'no-image.jpg'),
  organizer: ObjectId (ref: 'User', required),
  attendees: [{
    user: ObjectId (ref: 'User')
  }],
  createdAt: Date (default: now)
}
```

**Indexes:**
- `startDate`
- `location`

### 5. Resources Collection (`resources`)

Helpful resources, documents, and links for students.

**Schema Fields:**

```javascript
{
  title: String (required, max: 100 chars),
  description: String (required),
  type: String (enum: ['Document', 'Video', 'Blog', 'Tutorial', 'Course', 'Telegram', 'Scholarship', 'External Link'], required),
  category: String (enum: ['Academic', 'Administrative', 'Cultural', 'Career', 'Employment', 'Scholarship', 'General'], required),
  fileUrl: String (for uploaded files),
  externalUrl: String (for external links),
  thumbnail: String (default: 'no-image.jpg'),
  user: ObjectId (ref: 'User', required),
  updatedAt: Date (default: now),
  createdAt: Date (default: now)
}
```

**Indexes:**
- `type`
- `category`

## Database Management Scripts

### Quick Setup Commands

```bash
# Initialize database with sample data
npm run db:init

# Reset database (clear all data and recreate with samples)
npm run db:reset

# Get database information and statistics
npm run db:info

# Create backup
npm run db:backup

# List available backups
npm run db:list-backups

# Restore from backup
npm run db:restore path/to/backup.json
```

### User Management Commands

```bash
# List all users
npm run db:list-users

# Create admin user
npm run db:create-admin

# Clear specific collections
npm run db:clear-users
npm run db:clear-blogs
npm run db:clear-events
npm run db:clear-resources
npm run db:clear-profiles
```

### Advanced Commands

```bash
# Reset user password
node scripts/db-manager.js reset-password user@email.com newpassword

# Get detailed database info
node scripts/db-manager.js info

# Clear specific collection
node scripts/db-manager.js clear users
```

## Sample Data

The database initialization script creates sample data including:

### Default Users:
1. **Admin User** (jean.mukendi@example.com / password123)
   - Role: admin
   - Full access to all features

2. **Student Users** (marie.kalonda@example.com / password123)
   - Role: student
   - Regular user permissions

### Sample Content:
- **2 Blog posts** with different categories
- **3 Events** with various dates and locations
- **5 Resources** covering different types and categories
- **2 User profiles** with complete information

## Environment Variables

Required environment variables in `.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/congolese-students-china
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
MAX_FILE_SIZE=5000000
FILE_UPLOAD_PATH=./public/uploads
```

## Database Connection

The database connection is managed in `config/db.js`:

```javascript
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};
```

## Backup & Restore

### Backup Process:
- Creates JSON backup of all collections
- Includes metadata (timestamp, collection counts)
- Stored in `/backups` directory
- Named with timestamp: `backup-YYYY-MM-DDTHH-MM-SS.json`

### Restore Process:
- Clears existing data
- Imports data from backup file
- Maintains referential integrity
- Rebuilds indexes automatically

## Security Features

1. **Password Hashing**: Using bcryptjs with salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Data Validation**: Mongoose schema validation
4. **Unique Constraints**: Email and passport number uniqueness
5. **Role-based Access**: Admin and student roles

## Performance Optimizations

1. **Database Indexes**: Strategic indexing on frequently queried fields
2. **Pagination**: Built-in pagination for large datasets
3. **Lean Queries**: Using `.lean()` for read-only operations
4. **Connection Pooling**: MongoDB native connection pooling

## Development Workflow

1. **Setup**: Run `npm run db:init` for fresh installation
2. **Development**: Use sample data for testing
3. **Backup**: Regular backups with `npm run db:backup`
4. **Reset**: Use `npm run db:reset` to start fresh
5. **Production**: Ensure proper environment variables

## Troubleshooting

### Common Issues:

1. **Connection Failed**: Check if MongoDB is running
2. **Duplicate Key Error**: Check unique constraints (email, passport)
3. **Validation Error**: Check required fields and data formats
4. **Permission Error**: Ensure proper file system permissions for uploads

### Debug Commands:

```bash
# Check database status
npm run db:info

# List all users
npm run db:list-users

# Check available backups
npm run db:list-backups
```

## API Endpoints

The database is accessed through REST API endpoints:

- **Users**: `/api/users` (POST - register)
- **Auth**: `/api/auth` (POST - login, GET - user info)
- **Profiles**: `/api/profile` (GET, POST, PUT, DELETE)
- **Blogs**: `/api/blogs` (GET, POST, PUT, DELETE)
- **Events**: `/api/events` (GET, POST, PUT, DELETE)
- **Resources**: `/api/resources` (GET, POST, PUT, DELETE)

## Migration Guide

For database schema changes:

1. Create backup: `npm run db:backup`
2. Update model schemas
3. Run migration script
4. Test with sample data
5. Deploy to production

This documentation provides a complete overview of the database structure and management tools for the Congolese Students China project.
