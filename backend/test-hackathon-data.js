const { sequelize, Hackathon } = require('./models');

async function testHackathonData() {
  try {
    console.log('🔍 Testing hackathon data...');
    
    // Test if we can connect to the database
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check if hackathons table exists
    const [tableExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathons'
      );
    `);
    
    console.log('Hackathons table exists:', tableExists[0].exists);
    
    if (tableExists[0].exists) {
      // Try to query hackathons
      try {
        const hackathons = await Hackathon.findAll();
        console.log(`✅ Found ${hackathons.length} hackathons in database`);
        
        if (hackathons.length > 0) {
          console.log('📋 Hackathons:');
          hackathons.forEach((hackathon, index) => {
            console.log(`${index + 1}. ${hackathon.name} (ID: ${hackathon.id})`);
            console.log(`   Status: ${hackathon.status}`);
            console.log(`   Published: ${hackathon.is_published}`);
            console.log(`   Created: ${hackathon.created_at}`);
          });
        } else {
          console.log('ℹ️  No hackathons found in database');
        }
      } catch (queryError) {
        console.error('❌ Error querying hackathons:', queryError.message);
      }
    } else {
      console.log('❌ Hackathons table does not exist!');
      console.log('💡 Run: node fix-hackathon-migration.js');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testHackathonData();
