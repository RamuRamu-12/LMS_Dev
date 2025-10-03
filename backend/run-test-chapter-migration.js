const { sequelize } = require('./models');

async function runTestChapterMigration() {
  try {
    console.log('🔄 Starting migration to add test_id to course_chapters...');
    
    // Check if test_id column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'course_chapters' 
      AND column_name = 'test_id'
    `);
    
    if (results.length > 0) {
      console.log('✅ test_id column already exists - no migration needed');
      return;
    }
    
    console.log('🔧 Adding test_id column to course_chapters table...');
    
    // Add test_id column
    await sequelize.query(`
      ALTER TABLE course_chapters 
      ADD COLUMN test_id INTEGER REFERENCES course_tests(id) ON DELETE SET NULL
    `);
    
    console.log('✅ Successfully added test_id column!');
    
    // Add index for better performance
    console.log('🔧 Adding index for test_id...');
    await sequelize.query(`
      CREATE INDEX idx_course_chapters_test_id ON course_chapters(test_id)
    `);
    
    console.log('✅ Successfully added index!');
    
    // Show current chapters and tests for reference
    console.log('\n📋 Current chapters:');
    const [chapters] = await sequelize.query(`
      SELECT id, title, course_id, video_url, pdf_url, test_id 
      FROM course_chapters 
      ORDER BY course_id, chapter_order
    `);
    
    chapters.forEach(chapter => {
      console.log(`  - ID: ${chapter.id}, Title: "${chapter.title}", Course: ${chapter.course_id}, Test: ${chapter.test_id || 'None'}`);
    });
    
    console.log('\n📋 Current tests:');
    const [tests] = await sequelize.query(`
      SELECT id, title, course_id, passing_score, is_active 
      FROM course_tests 
      ORDER BY course_id
    `);
    
    tests.forEach(test => {
      console.log(`  - ID: ${test.id}, Title: "${test.title}", Course: ${test.course_id}, Passing: ${test.passing_score}%, Active: ${test.is_active}`);
    });
    
    console.log('\n💡 Next steps:');
    console.log('1. Use the link script to connect a chapter to a test:');
    console.log('   node link-test-to-chapter.js <courseId> "<chapterTitle>" <testId>');
    console.log('2. Example: node link-test-to-chapter.js 1 "Final_Assignment" 1');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
runTestChapterMigration()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
