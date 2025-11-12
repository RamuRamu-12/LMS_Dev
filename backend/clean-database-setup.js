// Force development mode to disable SSL for local database
process.env.NODE_ENV = 'development';

const { sequelize, 
  User, Course, Enrollment, FileUpload, CourseChapter, ChapterProgress,
  Project, Document, Video, ProjectPhase, ProjectProgress,
  CourseTest, TestQuestion, TestQuestionOption, TestAttempt, TestAnswer,
  Certificate, ActivityLog, Achievement,
  Hackathon, HackathonParticipant, HackathonSubmission, HackathonGroup,
  HackathonGroupMember, HackathonJoinRequest,
  Group, GroupMember, ChatMessage, ChatParticipant, StudentPermission
} = require('./models');

async function cleanDatabaseSetup() {
  try {
    console.log('🧹 Starting complete database reset and setup...\n');
    console.log('⚠️  WARNING: This will DELETE ALL DATA and recreate the database schema!\n');

    // Step 1: Get all existing tables dynamically
    console.log('📋 Step 1: Discovering all existing tables...');
    const [existingTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tableNames = existingTables.map(t => t.table_name);
    console.log(`   Found ${tableNames.length} existing tables\n`);

    // Step 2: Drop all existing tables (in correct order to handle foreign keys)
    console.log('🗑️  Step 2: Dropping all existing tables...');
    
    // Drop tables that might have foreign key dependencies first
    const dependentTables = [
      'chapter_progress', 'course_chapters', 'enrollments', 'file_uploads',
      'test_answers', 'test_attempts', 'test_question_options', 'test_questions',
      'certificates', 'activity_logs', 'achievements',
      'hackathon_group_members', 'hackathon_groups', 'hackathon_submissions', 
      'hackathon_participants', 'hackathon_join_requests',
      'group_members', 'groups', 'chat_messages', 'chat_participants',
      'project_progress', 'project_phases', 'documents', 'videos', 'projects',
      'course_tests', 'courses', 'users', 'student_permissions', 'SequelizeMeta'
    ];

    // Drop all tables that exist
    for (const table of dependentTables) {
      if (tableNames.includes(table)) {
        try {
          await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
          console.log(`   ✅ Dropped ${table}`);
        } catch (error) {
          console.log(`   ⚠️  Could not drop ${table}: ${error.message}`);
        }
      }
    }

    // Drop any remaining tables that weren't in our list
    for (const table of tableNames) {
      if (!dependentTables.includes(table)) {
        try {
          await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
          console.log(`   ✅ Dropped ${table} (additional table)`);
        } catch (error) {
          console.log(`   ⚠️  Could not drop ${table}: ${error.message}`);
        }
      }
    }

    // Step 3: Drop all existing enum types
    console.log('\n🏷️  Step 3: Dropping all existing enum types...');
    const [existingEnums] = await sequelize.query(`
      SELECT t.typname as enum_name
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typname LIKE 'enum_%'
      GROUP BY t.typname
      ORDER BY t.typname;
    `);

    const enumNames = existingEnums.map(e => e.enum_name);
    console.log(`   Found ${enumNames.length} enum types\n`);

    for (const enumName of enumNames) {
      try {
        await sequelize.query(`DROP TYPE IF EXISTS "public"."${enumName}" CASCADE;`);
        console.log(`   ✅ Dropped ${enumName}`);
      } catch (error) {
        console.log(`   ⚠️  Could not drop ${enumName}: ${error.message}`);
      }
    }

    // Step 4: Create all tables from Sequelize models
    console.log('\n📋 Step 4: Creating all tables from current models...');
    console.log('   This will create tables based on your current backend schema...\n');

    try {
      // Sync all models to create tables
      // Using sync({ force: false, alter: false }) to create tables without dropping
      // Since we already dropped everything, this will create fresh tables
      await sequelize.sync({ force: false, alter: false });
      console.log('   ✅ All tables created from models\n');
    } catch (error) {
      console.error(`   ❌ Error syncing models: ${error.message}`);
      throw error;
    }

    // Step 5: Verify all tables were created
    console.log('🔍 Step 5: Verifying created tables...');
    const [createdTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`\n✅ Created ${createdTables.length} tables:`);
    createdTables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Step 6: Create SequelizeMeta table for migration tracking
    console.log('\n📝 Step 6: Setting up migration tracking...');
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
          "name" VARCHAR(255) NOT NULL PRIMARY KEY
        );
      `);
      console.log('   ✅ SequelizeMeta table created\n');
    } catch (error) {
      console.log(`   ⚠️  SequelizeMeta might already exist: ${error.message}\n`);
    }

    // Step 7: Get all migration files and mark them as completed
    console.log('📝 Step 7: Marking all migrations as completed...');
    const fs = require('fs');
    const path = require('path');
    const migrationsDir = path.join(__dirname, 'migrations');
    
    let migrationFiles = [];
    if (fs.existsSync(migrationsDir)) {
      migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.js'))
        .sort();
    }

    // Also include the hardcoded list as fallback
    const fallbackMigrations = [
      '001-create-users.js', '002-create-courses.js', '003-create-enrollments.js',
      '004-create-file-uploads.js', '005-create-course-chapters.js',
      '006-add-course-intro-content.js', '007-add-url-analysis.js',
      '008-add-chapter-content-fields.js', '009-create-chapter-progress.js',
      '009-update-chapters-for-urls.js', '010-fix-chapter-schema.js',
      '011-add-course-logo.js', '012-fix-enrollment-status-enum.js',
      '013-create-course-tests.js', '014-create-project-phases.js',
      '015-create-project-progress.js', '016-create-projects-and-documents.js',
      '017-create-videos-and-update-projects.js', '018-add-enrollment-rating-review.js',
      '019-add-admin-upload-fields.js', '020-create-test-questions.js',
      '021-create-test-question-options.js', '022-create-test-attempts.js',
      '023-create-test-answers.js', '024-create-certificates.js',
      '030-fix-tags-column-type.js', '031-add-profile-fields-to-users.js',
      '032-create-activity-logs.js', '033-create-achievements.js',
      '034-add-test-id-to-chapters.js', '035-create-hackathons.js',
      '036-create-hackathon-submissions.js', '037-create-student-permissions.js',
      '038-fix-hackathon-missing-columns.js', '039-create-hackathon-join-requests.js',
      '20241201000000-create-hackathon-groups.js',
      '20241201000002-create-groups.js',
      '20241201000003-create-chat-tables.js'
    ];

    // Use migration files from directory if available, otherwise use fallback
    const migrationsToMark = migrationFiles.length > 0 ? migrationFiles : fallbackMigrations;

    for (const migration of migrationsToMark) {
      try {
        await sequelize.query(`
          INSERT INTO "SequelizeMeta" (name) 
          VALUES ('${migration}')
          ON CONFLICT (name) DO NOTHING;
        `);
        console.log(`   ✅ Marked ${migration} as completed`);
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
          console.log(`   ⚠️  Could not mark ${migration}: ${error.message}`);
        }
      }
    }

    // Step 8: Verify schema completeness
    console.log('\n🔍 Step 8: Verifying schema completeness...');
    
    const expectedTables = [
      'users', 'courses', 'course_chapters', 'enrollments', 'file_uploads',
      'chapter_progress', 'projects', 'documents', 'videos', 'project_phases',
      'project_progress', 'course_tests', 'test_questions', 'test_question_options',
      'test_attempts', 'test_answers', 'certificates', 'activity_logs',
      'achievements', 'hackathons', 'hackathon_participants', 'hackathon_submissions',
      'hackathon_groups', 'hackathon_group_members', 'hackathon_join_requests',
      'groups', 'group_members', 'chat_messages', 'chat_participants',
      'student_permissions'
    ];

    const createdTableNames = createdTables.map(t => t.table_name);
    const missingTables = expectedTables.filter(table => !createdTableNames.includes(table));

    if (missingTables.length > 0) {
      console.log(`   ⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log('   This might be normal if some models are not yet defined.\n');
    } else {
      console.log('   ✅ All expected tables are present\n');
    }

    console.log('\n🎉 Complete database reset and setup completed successfully!');
    console.log('✨ Your database is now fresh and matches your current backend schema.');
    console.log('📝 All migrations are marked as completed.');
    console.log('\n💡 Next steps:');
    console.log('   1. Run migrations if needed: npm run db:migrate');
    console.log('   2. Create admin user: npm run db:create-admin');
    console.log('   3. Seed sample data (optional): npm run db:seed\n');

  } catch (error) {
    console.error('\n❌ Error during database setup:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the clean setup
cleanDatabaseSetup();
