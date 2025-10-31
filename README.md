# LMS Platform - Learning Management System

A comprehensive Learning Management System built with React and Node.js, featuring course management, user authentication, and interactive learning experiences.

## 🚀 Features

- **Course Management**: Create, edit, and manage courses with rich content
- **User Authentication**: Secure Google OAuth 2.0 integration
- **Role-Based Access**: Admin and Student roles with appropriate permissions
- **File Uploads**: Support for PDF and DOCX course materials with AWS S3 integration
- **Video Integration**: Custom video player with progress tracking
- **Responsive Design**: Mobile-first, accessible UI design with glass morphism effects
- **Real-time Updates**: Live course progress tracking and notifications
- **Advanced Filtering**: Search and filter courses by category, difficulty, and rating
- **User Management**: Comprehensive admin panel for user and course management
- **Profile Management**: User profile editing and account settings

## 🛠 Technology Stack

### Frontend
- **React 18+** with functional components and hooks
- **React Router DOM** for client-side routing
- **Tailwind CSS** for styling with custom glass morphism effects
- **React Hook Form** for form validation
- **Axios** for API communication
- **Framer Motion** for animations
- **React Query** for server state management

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database with Sequelize ORM
- **Google OAuth 2.0** authentication
- **AWS S3** for file storage
- **JWT** for session management
- **Multer** for file uploads
- **Helmet** for security

## 📁 Project Structure

```
LMS_Project/
├── frontend/                 # React.js frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles and Tailwind config
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Node.js backend application
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   ├── migrations/        # Database migrations
│   ├── package.json
│   └── server.js
├── database/              # Database scripts and migrations
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- AWS S3 account (for file storage)
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LMS_Project
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in both frontend and backend directories:

   **Backend `.env`:**
   ```env
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=lms_database
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET=your_s3_bucket_name
   ```

   **Frontend `.env`:**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb lms_database

   # Run migrations
   cd backend
   npm run migrate
   ```

5. **Start the application**
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend development server (in new terminal)
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `http://localhost:5000/api/auth/google/callback` (backend)

### AWS S3 Setup
1. Create an AWS S3 bucket
2. Configure CORS policy for file uploads
3. Create IAM user with S3 permissions
4. Add credentials to backend `.env` file

## 📱 Features Overview

### Authentication
- Google OAuth 2.0 integration
- Role-based access control (Admin/Student)
- Secure JWT token management
- Automatic role detection

### Course Management
- Create courses with title, description, and video URL
- Upload PDF and DOCX files
- Preview courses before publishing
- Edit and delete existing courses
- Course status management (Draft/Published)

### User Management
- Create student accounts
- View and manage user profiles
- Assign students to courses
- User activity tracking

### Student Features
- Browse available courses
- Search and filter courses
- Self-enrollment in courses
- Progress tracking
- Download course materials
- View embedded videos

### Dashboard Analytics
- Course statistics
- User engagement metrics
- Enrollment tracking
- Recent activity feed

## 🎨 UI/UX Features

### Modern Design System
- **Glass Morphism**: Frosted glass effects with backdrop blur
- **Gradient Backgrounds**: Sophisticated color gradients
- **Neumorphism**: Subtle 3D effects
- **Micro-interactions**: Smooth animations and transitions
- **Responsive Design**: Mobile-first approach

### Component Library
- Interactive course cards with hover effects
- Animated progress indicators
- Floating action buttons
- Custom form elements with floating labels
- Toast notifications
- Modal dialogs

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
npm test
```

### Test Coverage
- Unit tests for components and services
- Integration tests for API endpoints
- End-to-end tests for critical user flows

## 📊 Performance

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization
- Bundle size optimization
- Lazy loading for components

### Backend Optimization
- Database query optimization
- Caching with Redis (optional)
- Connection pooling
- Rate limiting

## 🔒 Security

### Authentication & Authorization
- Google OAuth 2.0
- JWT token validation
- Role-based access control
- Secure session management

### Data Protection
- Input validation and sanitization
- XSS protection
- CSRF protection
- File upload validation
- SQL injection prevention

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy build folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm run build
# Deploy to your server or cloud platform
```

### Environment Variables
Ensure all environment variables are properly configured in production.

## 📈 Monitoring

### Application Monitoring
- **PostHog Analytics**: User behavior tracking, event analytics, and session recordings (see [PostHog Setup Guide](frontend/POSTHOG_SETUP.md))
- Error tracking with Sentry
- Performance monitoring
- Uptime monitoring
- User analytics

### Logging
- Application logs
- Error logs
- Access logs
- Audit logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core LMS functionality
- **v1.1.0** - Added advanced UI components and animations
- **v1.2.0** - Enhanced security and performance optimizations

---

**Built with ❤️ using React.js and Node.js**
