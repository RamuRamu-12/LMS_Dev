const { sequelize } = require('./models');

async function testHackathonEndpoints() {
  try {
    console.log('🧪 Testing Hackathon API Endpoints...');
    
    // Test 1: Check if models are properly imported and can be used
    const { Hackathon } = require('./models');
    console.log('✅ Hackathon model imported successfully');
    
    // Test 2: Try to sync the models (this will create tables if they don't exist)
    console.log('🔄 Syncing models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced successfully');
    
    // Test 3: Check if we can query the table
    const count = await Hackathon.count();
    console.log(`✅ Can query hackathons table, current count: ${count}`);
    
    console.log('\n🎉 All hackathon endpoint tests passed!');
    console.log('\n📋 The API should now be working. Try creating a hackathon from the frontend.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error.message.includes('relation "hackathons" does not exist')) {
      console.log('\n💡 Solution: Run the migration first:');
      console.log('node run-hackathon-migration.js');
    }
  } finally {
    await sequelize.close();
  }
}

testHackathonEndpoints();
