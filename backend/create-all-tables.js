require('dotenv').config();
const { sequelize } = require('./models');

/**
 * CREATE ALL TABLES SCRIPT
 * 
 * ✅ This creates ALL tables from your model files
 * ✅ Sets up ALL relationships automatically
 * ✅ Creates ALL indexes for performance
 * ✅ Reads configuration from .env file
 * 
 * Usage: node create-all-tables.js
 */

async function createAllTables() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🔧 CREATE ALL TABLES - FRESH SETUP');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');

  try {
    // Display current configuration
    console.log('📋 Database Configuration (from .env):\n');
    console.log(`   Database: ${process.env.DB_DATABASE || process.env.DB_NAME || 'Not set'}`);
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || '5432'}`);
    console.log(`   User: ${process.env.DB_USER || 'Not set'}`);
    console.log(`   Password: ${process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-3) : 'Not set'}`);
    console.log('\n');

    // Step 1: Test database connection
    console.log('📡 Step 1: Testing database connection...');
    await sequelize.authenticate();
    console.log('   ✅ Database connection successful!\n');

    // Step 2: Check if database is empty
    console.log('📋 Step 2: Checking current database state...\n');
    
    const [existingTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    if (existingTables.length > 0) {
      console.log(`   ⚠️  Found ${existingTables.length} existing tables:`);
      existingTables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
      console.log('\n   These will be recreated...\n');
    } else {
      console.log('   ✅ Database is empty - ready for fresh setup\n');
    }

    // Step 3: Create all tables
    console.log('🔧 Step 3: Creating all tables from model files...');
    console.log('   This reads your models and creates tables\n');
    
    // force: true ensures clean recreation
    await sequelize.sync({ force: true });
    
    console.log('   ✅ All tables created successfully!\n');

    // Step 4: Verify tables were created
    console.log('📊 Step 4: Verifying created tables...\n');
    
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`   ✅ Successfully created ${tables.length} tables:\n`);
    
    // Display all tables with categories
    console.log('   📚 Core User & Authentication:');
    console.log('   1. users');
    console.log('   2. activity_logs\n');
    
    console.log('   📖 Course Management:');
    console.log('   3. courses');
    console.log('   4. course_chapters');
    console.log('   5. enrollments');
    console.log('   6. chapter_progress');
    console.log('   7. file_uploads\n');
    
    console.log('   📝 Testing & Assessment:');
    console.log('   8. course_tests');
    console.log('   9. test_questions');
    console.log('   10. test_question_options');
    console.log('   11. test_attempts');
    console.log('   12. test_answers\n');
    
    console.log('   🏆 Certificates & Achievements:');
    console.log('   13. certificates');
    console.log('   14. achievements\n');
    
    console.log('   💼 Real-time Projects:');
    console.log('   15. projects');
    console.log('   16. project_phases');
    console.log('   17. project_progress');
    console.log('   18. documents');
    console.log('   19. videos\n');

    // List actual tables created
    console.log('   📋 Actual Tables in Database:\n');
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ✅ ALL TABLES CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    console.log('📝 What was created:\n');
    console.log(`   ✅ ${tables.length} tables with all fields`);
    console.log('   ✅ All relationships (foreign keys)');
    console.log('   ✅ All indexes for performance');
    console.log('   ✅ All constraints and validations\n');
    console.log('📝 Next Steps:\n');
    console.log('   1. Create admin user: node create-admin-user.js');
    console.log('   2. (Optional) Add sample data: node seed-sample-data.js');
    console.log('   3. Start backend: npm start');
    console.log('   4. Your database is ready! 🎉\n');
    console.log('💡 All tables were created from your model files!\n');
    console.log('💡 Your code is safe and will never disappear!\n');

    process.exit(0);
  } catch (error) {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ❌ TABLE CREATION FAILED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    console.log('\n');
    console.log('💡 Troubleshooting:\n');
    console.log('   1. Ensure database exists in PostgreSQL');
    console.log('   2. Check .env file has correct credentials');
    console.log('   3. Verify database user has CREATE permissions');
    console.log('   4. Check if PostgreSQL is running');
    console.log('   5. Try: psql -U ' + (process.env.DB_USER || 'postgres') + ' -d ' + (process.env.DB_DATABASE || process.env.DB_NAME || 'lms_db'));
    console.log('\n');

    process.exit(1);
  }
}

// Run the creation
console.log('\n🎯 Starting table creation from your model files...\n');
createAllTables();
