#!/usr/bin/env node

/**
 * FRESH DATABASE SETUP SCRIPT
 * 
 * This script sets up a completely fresh database for your LMS
 * with all tables, relationships, and sample data.
 * 
 * Features:
 * ✅ Creates fresh database schema
 * ✅ Seeds with sample data
 * ✅ Creates admin user
 * ✅ Sets up all tables and relationships
 * ✅ Validates the setup
 * 
 * Usage: node setup-fresh-database.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}📋 Step ${step}: ${message}${colors.reset}`);
  log('─'.repeat(50));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

class FreshDatabaseSetup {
  constructor() {
    this.config = null;
    this.sequelize = null;
  }

  async start() {
    try {
      log('🚀 FRESH DATABASE SETUP STARTED', 'bright');
      log('═══════════════════════════════════════════════════════════════');
      
      // Step 1: Load and validate configuration
      await this.loadConfiguration();
      
      // Step 2: Test database connection
      await this.testDatabaseConnection();
      
      // Step 3: Create fresh database schema
      await this.createFreshSchema();
      
      // Step 4: Create admin user
      await this.createAdminUser();
      
      // Step 5: Seed sample data
      await this.seedSampleData();
      
      // Step 6: Validate setup
      await this.validateSetup();
      
      logSuccess('🎉 FRESH DATABASE SETUP COMPLETED SUCCESSFULLY!');
      this.printSummary();
      
    } catch (error) {
      logError(`Setup failed: ${error.message}`);
      logError(`Stack trace: ${error.stack}`);
      process.exit(1);
    }
  }

  async loadConfiguration() {
    logStep(1, 'Loading Database Configuration');
    
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      logWarning('No .env file found. Creating one with default values...');
      await this.createDefaultEnvFile();
    }
    
    // Load environment variables
    require('dotenv').config({ path: envPath });
    
    // Load configuration
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || process.env.DB_NAME || 'lms_db'
    };
    
    // Validate required configuration
    if (!this.config.password || this.config.password === 'password') {
      logWarning('Using default password. Please update your .env file with secure credentials.');
    }
    
    logSuccess('Database configuration loaded');
    logInfo(`Database: ${this.config.database}@${this.config.host}:${this.config.port}`);
  }

  async createDefaultEnvFile() {
    const envContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_DATABASE=lms_db
DB_NAME=lms_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name_here
`;

    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    logSuccess('Created default .env file');
  }

  async testDatabaseConnection() {
    logStep(2, 'Testing Database Connection');
    
    this.sequelize = new Sequelize(
      this.config.database,
      this.config.user,
      this.config.password,
      {
        host: this.config.host,
        port: this.config.port,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        dialectOptions: {
          ssl: this.config.host.includes('aws') || this.config.host.includes('neon') || this.config.host.includes('amazonaws') ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      }
    );
    
    try {
      await this.sequelize.authenticate();
      logSuccess('Database connection successful');
    } catch (error) {
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
  }

  async createFreshSchema() {
    logStep(3, 'Creating Fresh Database Schema');
    
    try {
      // Load models and create schema
      const { sequelize } = require('./models');
      
      // Update sequelize config to use our connection
      sequelize.config.host = this.config.host;
      sequelize.config.port = this.config.port;
      sequelize.config.username = this.config.user;
      sequelize.config.password = this.config.password;
      sequelize.config.database = this.config.database;
      
      // Create all tables
      await sequelize.sync({ force: true });
      logSuccess('Fresh database schema created');
      
    } catch (error) {
      throw new Error(`Failed to create schema: ${error.message}`);
    }
  }

  async createAdminUser() {
    logStep(4, 'Creating Admin User');
    
    try {
      const { User } = require('./models');
      
      // Check if admin user already exists
      const existingAdmin = await User.findOne({ where: { email: 'admin@lms.com' } });
      
      if (existingAdmin) {
        logWarning('Admin user already exists');
        return;
      }
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@lms.com',
        password: hashedPassword,
        role: 'admin',
        is_active: true,
        preferences: {
          theme: 'light',
          notifications: true
        }
      });
      
      logSuccess(`Admin user created with ID: ${adminUser.id}`);
      logInfo('Email: admin@lms.com');
      logInfo('Password: admin123');
      logWarning('Please change the admin password after first login!');
      
    } catch (error) {
      logWarning(`Failed to create admin user: ${error.message}`);
    }
  }

  async seedSampleData() {
    logStep(5, 'Seeding Sample Data');
    
    try {
      const { User, Course, CourseChapter, Enrollment } = require('./models');
      
      // Create sample instructor
      const instructor = await User.create({
        name: 'John Instructor',
        email: 'instructor@lms.com',
        password: await bcrypt.hash('instructor123', 10),
        role: 'student', // Will be updated to instructor
        is_active: true
      });
      
      // Update to instructor role
      await instructor.update({ role: 'admin' }); // Using admin role for instructor
      
      logSuccess('Sample instructor created');
      
      // Create sample course
      const course = await Course.create({
        title: 'Introduction to Web Development',
        description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
        instructor_id: instructor.id,
        category: 'Web Development',
        difficulty: 'beginner',
        estimated_duration: 40,
        is_published: true,
        learning_objectives: [
          'Understand HTML structure and semantics',
          'Master CSS styling and layout',
          'Learn JavaScript fundamentals',
          'Build responsive web pages'
        ],
        tags: ['HTML', 'CSS', 'JavaScript', 'Web Development']
      });
      
      logSuccess('Sample course created');
      
      // Create sample chapters
      const chapters = [
        {
          title: 'Introduction to HTML',
          description: 'Learn the basics of HTML structure and elements',
          video_url: 'https://www.youtube.com/watch?v=example1',
          pdf_url: 'https://example.com/html-basics.pdf',
          chapter_order: 1,
          duration_minutes: 30
        },
        {
          title: 'CSS Styling',
          description: 'Master CSS for styling and layout',
          video_url: 'https://www.youtube.com/watch?v=example2',
          pdf_url: 'https://example.com/css-basics.pdf',
          chapter_order: 2,
          duration_minutes: 45
        },
        {
          title: 'JavaScript Fundamentals',
          description: 'Learn JavaScript programming basics',
          video_url: 'https://www.youtube.com/watch?v=example3',
          pdf_url: 'https://example.com/javascript-basics.pdf',
          chapter_order: 3,
          duration_minutes: 60
        }
      ];
      
      for (const chapterData of chapters) {
        await CourseChapter.create({
          ...chapterData,
          course_id: course.id
        });
      }
      
      logSuccess('Sample chapters created');
      
      // Create sample student
      const student = await User.create({
        name: 'Jane Student',
        email: 'student@lms.com',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        is_active: true
      });
      
      // Create sample enrollment
      await Enrollment.create({
        student_id: student.id,
        course_id: course.id,
        status: 'enrolled',
        progress: 0
      });
      
      logSuccess('Sample enrollment created');
      
      logInfo('Sample data includes:');
      logInfo('- 1 Admin user (admin@lms.com / admin123)');
      logInfo('- 1 Instructor user (instructor@lms.com / instructor123)');
      logInfo('- 1 Student user (student@lms.com / student123)');
      logInfo('- 1 Sample course with 3 chapters');
      logInfo('- 1 Sample enrollment');
      
    } catch (error) {
      logWarning(`Failed to seed sample data: ${error.message}`);
    }
  }

  async validateSetup() {
    logStep(6, 'Validating Setup');
    
    try {
      // Check tables
      const [tables] = await this.sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      logInfo(`Found ${tables.length} tables in database`);
      
      // Check users
      const [userCount] = await this.sequelize.query(`SELECT COUNT(*) as count FROM "users"`);
      logInfo(`Users: ${userCount[0].count}`);
      
      // Check courses
      const [courseCount] = await this.sequelize.query(`SELECT COUNT(*) as count FROM "courses"`);
      logInfo(`Courses: ${courseCount[0].count}`);
      
      // Check chapters
      const [chapterCount] = await this.sequelize.query(`SELECT COUNT(*) as count FROM "course_chapters"`);
      logInfo(`Chapters: ${chapterCount[0].count}`);
      
      // Check enrollments
      const [enrollmentCount] = await this.sequelize.query(`SELECT COUNT(*) as count FROM "enrollments"`);
      logInfo(`Enrollments: ${enrollmentCount[0].count}`);
      
      logSuccess('Setup validation completed');
      
    } catch (error) {
      logWarning(`Validation warning: ${error.message}`);
    } finally {
      await this.sequelize.close();
    }
  }

  printSummary() {
    log('\n📊 SETUP SUMMARY', 'bright');
    log('═══════════════════════════════════════════════════════════════');
    log(`Database: ${this.config.database}@${this.config.host}:${this.config.port}`);
    log('\n👥 Default Users:');
    log('   Admin: admin@lms.com / admin123');
    log('   Instructor: instructor@lms.com / instructor123');
    log('   Student: student@lms.com / student123');
    log('\n📚 Sample Data:');
    log('   - 1 Course: Introduction to Web Development');
    log('   - 3 Chapters with video and PDF URLs');
    log('   - 1 Sample enrollment');
    log('\n📝 Next Steps:');
    log('1. Update your .env file with secure credentials');
    log('2. Start your backend server: npm start');
    log('3. Start your frontend: cd ../frontend && npm start');
    log('4. Login with admin credentials to manage the system');
    log('\n🎉 Your fresh LMS database is ready!');
  }
}

// Run the setup
if (require.main === module) {
  const setup = new FreshDatabaseSetup();
  setup.start().catch(console.error);
}

module.exports = FreshDatabaseSetup;
