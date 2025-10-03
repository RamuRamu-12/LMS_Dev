const { sequelize } = require('./models');

async function findIds() {
  try {
    console.log('🔍 Finding Course, Chapter, and Test IDs...\n');
    
    // Get all courses
    console.log('📚 COURSES:');
    const [courses] = await sequelize.query(`
      SELECT id, title, category, difficulty 
      FROM courses 
      ORDER BY id
    `);
    
    courses.forEach(course => {
      console.log(`  ID: ${course.id} | Title: "${course.title}" | Category: ${course.category} | Difficulty: ${course.difficulty}`);
    });
    
    console.log('\n📖 CHAPTERS:');
    const [chapters] = await sequelize.query(`
      SELECT id, title, course_id, video_url, pdf_url, test_id 
      FROM course_chapters 
      ORDER BY course_id, chapter_order
    `);
    
    chapters.forEach(chapter => {
      const content = [];
      if (chapter.video_url) content.push('Video');
      if (chapter.pdf_url) content.push('PDF');
      if (chapter.test_id) content.push('Test');
      const contentStr = content.length > 0 ? content.join(', ') : 'No content';
      
      console.log(`  ID: ${chapter.id} | Title: "${chapter.title}" | Course: ${chapter.course_id} | Content: ${contentStr} | Test ID: ${chapter.test_id || 'None'}`);
    });
    
    console.log('\n📝 TESTS:');
    const [tests] = await sequelize.query(`
      SELECT id, title, course_id, passing_score, time_limit_minutes, max_attempts, is_active 
      FROM course_tests 
      ORDER BY course_id
    `);
    
    tests.forEach(test => {
      console.log(`  ID: ${test.id} | Title: "${test.title}" | Course: ${test.course_id} | Passing: ${test.passing_score}% | Time: ${test.time_limit_minutes || '∞'}min | Active: ${test.is_active}`);
    });
    
    console.log('\n💡 To link a chapter to a test, use:');
    console.log('node link-test-to-chapter.js <courseId> "<chapterTitle>" <testId>');
    console.log('\nExample:');
    if (chapters.length > 0 && tests.length > 0) {
      const firstChapter = chapters[0];
      const firstTest = tests[0];
      console.log(`node link-test-to-chapter.js ${firstChapter.course_id} "${firstChapter.title}" ${firstTest.id}`);
    }
    
  } catch (error) {
    console.error('❌ Error finding IDs:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

findIds();
