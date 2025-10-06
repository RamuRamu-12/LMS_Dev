const { Hackathon } = require('./models');

async function testEditHackathon() {
  try {
    console.log('🧪 Testing hackathon update functionality...');
    
    // Find the first hackathon
    const hackathon = await Hackathon.findOne({
      order: [['created_at', 'DESC']]
    });
    
    if (!hackathon) {
      console.log('❌ No hackathons found to test with');
      return;
    }
    
    console.log(`✅ Found hackathon: ${hackathon.name} (ID: ${hackathon.id})`);
    
    // Test update
    const updateData = {
      name: hackathon.name + ' - Updated',
      description: hackathon.description + ' - This is an updated description',
      updated_by: hackathon.created_by // Use the same creator as updater
    };
    
    console.log('🔄 Updating hackathon...');
    await hackathon.update(updateData);
    
    console.log('✅ Hackathon updated successfully!');
    console.log(`📋 New name: ${hackathon.name}`);
    console.log(`📋 New description: ${hackathon.description}`);
    
    // Test that we can query it back
    const updatedHackathon = await Hackathon.findByPk(hackathon.id);
    if (updatedHackathon) {
      console.log('✅ Updated hackathon found in database');
      console.log(`📋 Confirmed name: ${updatedHackathon.name}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEditHackathon();
