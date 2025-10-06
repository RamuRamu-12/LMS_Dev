const { Hackathon, User } = require('./models');

async function testHackathonCreation() {
  try {
    console.log('🧪 Testing hackathon creation...');
    
    // Test if we can create a hackathon
    const testHackathon = await Hackathon.create({
      name: 'Test Hackathon - ' + new Date().toISOString(),
      description: 'This is a test hackathon',
      start_date: new Date('2024-12-01'),
      end_date: new Date('2024-12-03'),
      created_by: 1, // Assuming admin user with ID 1
      updated_by: 1
    });
    
    console.log('✅ Test hackathon created successfully!');
    console.log('📋 Details:', {
      id: testHackathon.id,
      name: testHackathon.name,
      created_at: testHackathon.created_at
    });
    
    // Test if we can query it back
    const foundHackathon = await Hackathon.findByPk(testHackathon.id);
    if (foundHackathon) {
      console.log('✅ Test hackathon found in database');
    } else {
      console.log('❌ Test hackathon not found in database');
    }
    
    // Test getAllHackathons query
    const allHackathons = await Hackathon.findAll({
      order: [['created_at', 'DESC']]
    });
    
    console.log(`✅ Found ${allHackathons.length} total hackathons in database`);
    
    if (allHackathons.length > 0) {
      console.log('📋 Recent hackathons:');
      allHackathons.slice(0, 3).forEach((h, i) => {
        console.log(`${i + 1}. ${h.name} (ID: ${h.id})`);
      });
    }
    
    // Clean up test hackathon
    await testHackathon.destroy();
    console.log('✅ Test hackathon cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('relation "hackathons" does not exist')) {
      console.log('\n💡 SOLUTION: The hackathon tables don\'t exist!');
      console.log('Run this command to create them:');
      console.log('cd backend && node force-create-hackathon-tables.js');
    }
  }
}

testHackathonCreation();
