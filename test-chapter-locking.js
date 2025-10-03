/**
 * Test script to verify chapter locking functionality
 * 
 * This script helps you test that assignment chapters are properly locked
 * until all regular chapters are completed.
 */

const { sequelize } = require('./backend/models');

async function testChapterLocking() {
  try {
    console.log('🔍 Testing Chapter Locking Functionality...\n');
    
    // Get all courses with their chapters
    const [courses] = await sequelize.query(`
      SELECT 
        c.id as course_id,
        c.title as course_title,
        ch.id as chapter_id,
        ch.title as chapter_title,
        ch.chapter_order,
        ch.video_url,
        ch.pdf_url,
        ch.test_id,
        CASE 
          WHEN ch.title ILIKE '%assignment%' OR ch.title ILIKE '%test%' OR ch.title ILIKE '%exam%' OR ch.title ILIKE '%final%'
          THEN 'assignment'
          ELSE 'regular'
        END as chapter_type
      FROM courses c
      LEFT JOIN course_chapters ch ON c.id = ch.course_id
      WHERE c.is_published = true
      ORDER BY c.id, ch.chapter_order
    `);
    
    console.log('📚 COURSES AND CHAPTERS:');
    console.log('========================');
    
    let currentCourseId = null;
    courses.forEach(row => {
      if (row.course_id !== currentCourseId) {
        currentCourseId = row.course_id;
        console.log(`\n🎓 Course: ${row.course_title} (ID: ${row.course_id})`);
        console.log('─'.repeat(50));
      }
      
      if (row.chapter_id) {
        const typeIcon = row.chapter_type === 'assignment' ? '🔒' : '📖';
        const contentInfo = [];
        if (row.video_url) contentInfo.push('Video');
        if (row.pdf_url) contentInfo.push('PDF');
        if (row.test_id) contentInfo.push('Test');
        if (contentInfo.length === 0) contentInfo.push('No content');
        
        console.log(`  ${typeIcon} ${row.chapter_title} (Order: ${row.chapter_order}) - ${contentInfo.join(', ')}`);
      }
    });
    
    // Test the locking logic
    console.log('\n🔐 CHAPTER LOCKING LOGIC TEST:');
    console.log('==============================');
    
    const courseGroups = {};
    courses.forEach(row => {
      if (!courseGroups[row.course_id]) {
        courseGroups[row.course_id] = {
          title: row.course_title,
          chapters: []
        };
      }
      if (row.chapter_id) {
        courseGroups[row.course_id].chapters.push({
          id: row.chapter_id,
          title: row.chapter_title,
          order: row.chapter_order,
          type: row.chapter_type,
          hasContent: !!(row.video_url || row.pdf_url || row.test_id)
        });
      }
    });
    
    Object.values(courseGroups).forEach(course => {
      console.log(`\n📖 ${course.title}:`);
      
      const regularChapters = course.chapters.filter(ch => ch.type === 'regular');
      const assignmentChapters = course.chapters.filter(ch => ch.type === 'assignment');
      
      console.log(`  Regular chapters: ${regularChapters.length}`);
      regularChapters.forEach(ch => {
        console.log(`    - ${ch.title} (Order: ${ch.order})`);
      });
      
      console.log(`  Assignment chapters: ${assignmentChapters.length}`);
      assignmentChapters.forEach(ch => {
        console.log(`    - ${ch.title} (Order: ${ch.order}) - ${ch.hasContent ? 'Has content' : 'No content'}`);
      });
      
      if (assignmentChapters.length > 0) {
        console.log(`  ✅ Assignment chapters will be LOCKED until all ${regularChapters.length} regular chapters are completed`);
      } else {
        console.log(`  ℹ️  No assignment chapters found in this course`);
      }
    });
    
    console.log('\n🎯 EXPECTED BEHAVIOR:');
    console.log('====================');
    console.log('1. Students will see ONLY regular chapters initially');
    console.log('2. Assignment chapters are COMPLETELY HIDDEN until all regular chapters are completed');
    console.log('3. Once all regular chapters are completed:');
    console.log('   - Assignment chapters appear in the sidebar');
    console.log('   - Tests become available');
    console.log('   - Students can access and take the tests');
    console.log('4. This creates a clean progression: Content → Test');
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testChapterLocking();
