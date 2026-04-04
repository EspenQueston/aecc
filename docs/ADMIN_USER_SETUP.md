# Admin User Setup - AECC System

## Admin User Created Successfully ✅

**Email:** `cluivertmoukendi@gmail.com`  
**Password:** `AdminAECC@2025`  
**Role:** `admin`  
**Status:** Active and Ready for Use

## Admin Panel Access

### Login URL
🔗 **Admin Panel Login:** http://localhost:5000/admin/login.html

### Admin Panel Features
- **Dashboard:** Overview of system statistics
- **Blog Management:** Create, edit, delete blog posts
- **Event Management:** Manage events and announcements  
- **Resource Management:** Manage resources and files
- **User Management:** View and manage user accounts
- **Profile Management:** Handle user profiles
- **Settings:** System configuration

## Security Features

### Authentication System
1. **JWT Token-based Authentication**
   - Tokens expire after 24 hours
   - Secure token validation on all admin endpoints

2. **Role-based Access Control**
   - Only users with `admin` role can access admin panel
   - Email-based admin authorization list

3. **Protected API Endpoints**
   - All admin APIs use `adminAuth` middleware
   - Double-layer protection (role + email verification)

### Admin Email Whitelist
The following emails are authorized as admins:
- `cluivertmoukendi@gmail.com`
- `admin@aecc.org` (default backup admin)

### Client-side Protection
- Automatic authentication checks on page load
- Redirect to login if not authenticated
- Role verification before allowing access

## API Endpoints Protected

### Admin-only Endpoints (require `adminAuth` middleware):
- `DELETE /api/wp-posts/:id` - Delete blog posts
- `POST /api/wp-posts/categories` - Create categories
- `POST /api/wp-posts/tags` - Create tags
- Admin management endpoints

### Regular User Endpoints (require `auth` middleware):
- User profile management
- User blog post creation
- User data updates

## How to Access the Admin Panel

1. **Navigate to Login Page:**
   ```
   http://localhost:5000/admin/login.html
   ```

2. **Enter Credentials:**
   - Email: `cluivertmoukendi@gmail.com`
   - Password: `AdminAECC@2025`

3. **Click "Login" button**

4. **You will be redirected to the admin dashboard:**
   ```
   http://localhost:5000/admin/index.html
   ```

## Admin Panel Navigation

### Main Sections:
- **📊 Dashboard** - System overview and statistics
- **📝 Blogs** - Manage blog posts and categories
- **📅 Events** - Event management system
- **📚 Resources** - Resource and file management
- **👥 Users** - User account management
- **👤 Profiles** - User profile management
- **⚙️ Settings** - System configuration

## Password Security

- **Current Password:** `AdminAECC@2025`
- **Password Policy:** 
  - Minimum 8 characters
  - Contains uppercase, lowercase, numbers, and special characters
  - Hashed using bcrypt with salt

## Admin User Management Scripts

### Create/Update Admin User:
```bash
node scripts/create-admin.js
```

### Setup Admin with Custom Password:
```bash
node scripts/setup-admin-user.js
```

## Database Details

### User Record:
- **Collection:** `users`
- **Email:** `cluivertmoukendi@gmail.com`
- **Role:** `admin`
- **Password:** Hashed with bcrypt
- **Created/Updated:** Current timestamp

## Troubleshooting

### If you can't access the admin panel:

1. **Check server is running:**
   ```bash
   cd "c:\Users\Cluivert\CascadeProjects\congolese-students-china"
   node server.js
   ```

2. **Verify user exists:**
   ```bash
   node scripts/setup-admin-user.js
   ```

3. **Clear browser cache and try again**

4. **Check browser console for errors**

### If login fails:
- Verify email: `cluivertmoukendi@gmail.com`
- Verify password: `AdminAECC@2025`
- Check network tab for API errors
- Ensure server is running on port 5000

## Security Recommendations

1. **Change Default Password:** After first login, consider changing the password
2. **Monitor Admin Access:** Keep track of admin login activities
3. **Regular Security Updates:** Keep dependencies updated
4. **Backup Admin Access:** Ensure `admin@aecc.org` account is also functional
5. **Environment Variables:** Store sensitive config in `.env` file

## Contact

For any issues with admin access, please check the system logs or contact the system administrator.

---
**Last Updated:** June 30, 2025  
**Status:** ✅ Active and Functional
