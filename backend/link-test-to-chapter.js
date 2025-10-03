/**
 * Script to link a test to a chapter
 * 
 * Usage: node link-test-to-chapter.js <courseId> <chapterTitle> <testId>
 * Example: node link-test-to-chapter.js 1 "Final_Assignment" 1
 */

const { CourseChapter, CourseTest, Course } = require('./models');

async function linkTestToChapter(courseId, chapterTitle, testId) {
  try {
    // Find the course
    const course = await Course.findByPk(courseId);
    if (!course) {
      console.error(`❌ Course with ID ${courseId} not found`);
      process.exit(1);
    }

    console.log(`✓ Found course: ${course.title}`);

    // Find the test
    const test = await CourseTest.findByPk(testId);
    if (!test) {
      console.error(`❌ Test with ID ${testId} not found`);
      process.exit(1);
    }

    console.log(`✓ Found test: ${test.title}`);

    // Find the chapter
    const chapter = await CourseChapter.findOne({
      where: {
        course_id: courseId,
        title: chapterTitle
      }
    });

    if (!chapter) {
      console.error(`❌ Chapter "${chapterTitle}" not found in course ${courseId}`);
      process.exit(1);
    }

    console.log(`✓ Found chapter: ${chapter.title} (ID: ${chapter.id})`);

    // Update chapter to link to test
    // Remove validation temporarily by setting empty URLs to null
    await chapter.update({
      test_id: testId,
      video_url: chapter.video_url || null,
      pdf_url: chapter.pdf_url || null
    }, {
      hooks: false  // Skip validation hooks
    });

    console.log(`\n✅ Successfully linked test "${test.title}" to chapter "${chapter.title}"`);
    console.log(`\nChapter Details:`);
    console.log(`  - ID: ${chapter.id}`);
    console.log(`  - Title: ${chapter.title}`);
    console.log(`  - Test ID: ${chapter.test_id}`);
    console.log(`  - Video URL: ${chapter.video_url || 'None'}`);
    console.log(`  - PDF URL: ${chapter.pdf_url || 'None'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error linking test to chapter:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.log('Usage: node link-test-to-chapter.js <courseId> <chapterTitle> <testId>');
  console.log('Example: node link-test-to-chapter.js 1 "Final_Assignment" 1');
  process.exit(1);
}

const [courseId, chapterTitle, testId] = args;

linkTestToChapter(parseInt(courseId), chapterTitle, parseInt(testId));

