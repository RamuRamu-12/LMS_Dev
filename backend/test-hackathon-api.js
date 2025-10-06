const { Hackathon, User } = require('./models');

async function testHackathonAPI() {
  try {
    console.log('🔍 Testing hackathon API response...');
    
    // Simulate the getAllHackathons query exactly like the controller
    const { count, rows: hackathons } = await Hackathon.findAndCountAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
      offset: 0
    });
    
    console.log('✅ Database query successful');
    console.log(`📊 Found ${count} total hackathons`);
    console.log(`📋 Retrieved ${hackathons.length} hackathons`);
    
    if (hackathons.length > 0) {
      console.log('\n📋 Hackathons found:');
      hackathons.forEach((hackathon, index) => {
        console.log(`${index + 1}. ${hackathon.name} (ID: ${hackathon.id})`);
        console.log(`   Status: ${hackathon.status}`);
        console.log(`   Published: ${hackathon.is_published}`);
        console.log(`   Creator: ${hackathon.creator ? hackathon.creator.name : 'Unknown'}`);
        console.log('   ---');
      });
    }
    
    // Test the exact response format that the API returns
    const apiResponse = {
      success: true,
      data: {
        hackathons,
        pagination: {
          total: count,
          page: 1,
          limit: 10,
          pages: Math.ceil(count / 10)
        }
      }
    };
    
    console.log('\n📤 API Response structure:');
    console.log('✅ success:', apiResponse.success);
    console.log('✅ data.hackathons.length:', apiResponse.data.hackathons.length);
    console.log('✅ data.pagination.total:', apiResponse.data.pagination.total);
    
    // Check if any hackathons are published
    const publishedHackathons = hackathons.filter(h => h.is_published);
    console.log(`📊 Published hackathons: ${publishedHackathons.length}`);
    
    if (publishedHackathons.length === 0) {
      console.log('\n⚠️  WARNING: No hackathons are published!');
      console.log('💡 This might be why they\'re not showing up in the student view.');
      console.log('💡 Admin should see all hackathons regardless of published status.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testHackathonAPI();