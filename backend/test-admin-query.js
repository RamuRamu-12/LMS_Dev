const { Hackathon, User } = require('./models');

async function testAdminQuery() {
  try {
    console.log('🔍 Testing admin hackathon query...');
    
    // First, let's see all hackathons without any filters (like admin should)
    console.log('\n1️⃣ Testing admin query (no filters):');
    const adminQuery = await Hackathon.findAndCountAll({
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
    
    console.log(`✅ Admin query found ${adminQuery.count} total hackathons`);
    console.log(`✅ Admin query retrieved ${adminQuery.rows.length} hackathons`);
    
    if (adminQuery.rows.length > 0) {
      console.log('\n📋 Admin view hackathons:');
      adminQuery.rows.forEach((hackathon, index) => {
        console.log(`${index + 1}. ${hackathon.name} (ID: ${hackathon.id})`);
        console.log(`   Published: ${hackathon.is_published}`);
        console.log(`   Status: ${hackathon.status}`);
        console.log(`   Created: ${hackathon.created_at}`);
        console.log('   ---');
      });
    }
    
    // Now let's test the student query (only published hackathons)
    console.log('\n2️⃣ Testing student query (published only):');
    const studentQuery = await Hackathon.findAndCountAll({
      where: { is_published: true },
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
    
    console.log(`✅ Student query found ${studentQuery.count} published hackathons`);
    console.log(`✅ Student query retrieved ${studentQuery.rows.length} published hackathons`);
    
    // Check if any hackathons need to be published
    const unpublishedHackathons = adminQuery.rows.filter(h => !h.is_published);
    if (unpublishedHackathons.length > 0) {
      console.log('\n📝 Unpublished hackathons that need to be published:');
      unpublishedHackathons.forEach((hackathon, index) => {
        console.log(`${index + 1}. ${hackathon.name} (ID: ${hackathon.id})`);
      });
      
      console.log('\n💡 SOLUTION: Publish these hackathons to make them visible to students');
      console.log('💡 Admin should see all hackathons regardless of published status');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminQuery();
