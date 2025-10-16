const { sequelize } = require('./models');

async function fixTestIdColumn() {
  try {
    console.log('🔍 Checking current course_chapters table structure...');
    
    // Check if test_id column exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'course_chapters' 
      AND column_name = 'test_id'
    `);
    
    if (results.length > 0) {
      console.log('✅ test_id column already exists in course_chapters table!');
      return;
    }
    
    console.log('🔧 Adding missing test_id column to course_chapters table...');
    
    // Add test_id column
    await sequelize.query(`
      ALTER TABLE course_chapters 
      ADD COLUMN test_id INTEGER REFERENCES course_tests(id) ON DELETE SET NULL
    `);
    
    console.log('✅ Added test_id column to course_chapters table');
    
    // Add index for test_id
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_course_chapters_test_id ON course_chapters(test_id)
    `);
    
    console.log('✅ Added index for test_id column');
    
    console.log('🎉 Successfully fixed course_chapters table schema!');
    
  } catch (error) {
    console.error('❌ Error fixing test_id column:', error.message);
    throw error;
  }
}

// Run the fix
fixTestIdColumn()
  .then(() => {
    console.log('✨ Course chapters table schema fixed successfully!');
    console.log('📝 You should now be able to create course chapters without errors.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to fix course_chapters schema:', error.message);
    process.exit(1);
  });
