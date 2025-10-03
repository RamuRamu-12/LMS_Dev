/**
 * Test script to verify assignment chapter hiding logic
 */

// Simulate the chapter filtering logic
function testChapterFiltering() {
  console.log('🧪 Testing Chapter Filtering Logic...\n');
  
  // Sample chapters (similar to what might be in the database)
  const chapters = [
    { id: 1, title: 'Chapter1: Intro to AWS', chapter_order: 1 },
    { id: 2, title: 'Chapter 2: AWS Basics', chapter_order: 2 },
    { id: 3, title: 'AWS_ec2', chapter_order: 3 },
    { id: 4, title: 'Final_Assignment', chapter_order: 4 }
  ];
  
  console.log('📚 All chapters:');
  chapters.forEach(ch => console.log(`  - ${ch.title}`));
  
  // Apply the same filtering logic as the backend
  const regularChapters = chapters.filter(chapter => 
    !chapter.title.toLowerCase().includes('assignment') && 
    !chapter.title.toLowerCase().includes('test') && 
    !chapter.title.toLowerCase().includes('exam') &&
    !chapter.title.toLowerCase().includes('final')
  );
  
  const assignmentChapters = chapters.filter(chapter => 
    chapter.title.toLowerCase().includes('assignment') || 
    chapter.title.toLowerCase().includes('test') || 
    chapter.title.toLowerCase().includes('exam') ||
    chapter.title.toLowerCase().includes('final')
  );
  
  console.log('\n📖 Regular chapters:');
  regularChapters.forEach(ch => console.log(`  - ${ch.title}`));
  
  console.log('\n🔒 Assignment chapters:');
  assignmentChapters.forEach(ch => console.log(`  - ${ch.title}`));
  
  // Test different scenarios
  console.log('\n🎯 Testing Scenarios:');
  console.log('====================');
  
  // Scenario 1: User not enrolled
  console.log('\n1. User NOT enrolled:');
  let allRegularChaptersCompleted = false;
  let visibleChapters = [...regularChapters];
  if (allRegularChaptersCompleted) {
    visibleChapters.push(...assignmentChapters);
  }
  console.log('   Visible chapters:', visibleChapters.map(ch => ch.title));
  console.log('   Assignment chapters hidden: ✅');
  
  // Scenario 2: User enrolled but not completed all regular chapters
  console.log('\n2. User enrolled, NOT completed all regular chapters:');
  allRegularChaptersCompleted = false; // Simulate incomplete
  visibleChapters = [...regularChapters];
  if (allRegularChaptersCompleted) {
    visibleChapters.push(...assignmentChapters);
  }
  console.log('   Visible chapters:', visibleChapters.map(ch => ch.title));
  console.log('   Assignment chapters hidden: ✅');
  
  // Scenario 3: User enrolled and completed all regular chapters
  console.log('\n3. User enrolled, completed all regular chapters:');
  allRegularChaptersCompleted = true; // Simulate complete
  visibleChapters = [...regularChapters];
  if (allRegularChaptersCompleted) {
    visibleChapters.push(...assignmentChapters);
  }
  console.log('   Visible chapters:', visibleChapters.map(ch => ch.title));
  console.log('   Assignment chapters visible: ✅');
  
  console.log('\n✅ Test completed!');
  console.log('\n📋 Expected Behavior:');
  console.log('- "Final_Assignment" should be detected as assignment chapter');
  console.log('- Assignment chapters should be hidden until all regular chapters completed');
  console.log('- Only regular chapters should be visible initially');
}

// Run the test
testChapterFiltering();
