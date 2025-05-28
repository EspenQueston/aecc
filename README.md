# Association of Congolese Students in China Website

A comprehensive, dynamic, and user-friendly website for the Association of Congolese Students in China. This platform serves as a central hub for information, resources, and community engagement, catering to the needs of Congolese students studying in China.

## Features

- **Contact Information**: Contact details and interactive map
- **Blogs**: Member experiences, tips, and stories
- **About Us**: Association information, office members, and history
- **Resources**: Downloadable files and external resources
- **Learning Section**: Curated learning resources
- **Registration**: Comprehensive user registration system
- **Profile Page**: Personalized user profiles
- **Login**: Secure authentication system
- **Home Page**: Professional and engaging landing page
- **Community Forum**: Discussion board for student interaction
- **Events Calendar**: Upcoming events and activities
- **Newsletter**: Subscription-based updates
- **Multilingual Support**: English, French, and Chinese

## Tech Stack

- **Frontend**: React, Redux, Bootstrap
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Multer, AWS S3 (optional)
- **Deployment**: Heroku, Netlify, or similar

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd congolese-students-china
   ```

2. Install server dependencies
   ```
   npm install
   ```

3. Install client dependencies
   ```
   npm run install-client
   ```

4. Create a `.env` file in the root directory with the following variables
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. Run the development server
   ```
   npm run dev
   ```

## Project Structure

```
congolese-students-china/
├── client/                  # React frontend
├── config/                  # Configuration files
├── controllers/             # Route controllers
├── middleware/              # Custom middleware
├── models/                  # Database models
├── routes/                  # API routes
├── uploads/                 # Uploaded files
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies
├── README.md                # Project documentation
└── server.js                # Entry point
```

## License

This project is licensed under the MIT License.
