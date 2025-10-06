const { sequelize } = require('./config/database');

async function checkHackathonsDirect() {
  try {
    console.log('🔍 Checking hackathons directly in database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check if hackathons table exists
    const [tableCheck] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathons'
      );
    `);
    
    console.log('Hackathons table exists:', tableCheck[0].exists);
    
    if (tableCheck[0].exists) {
      // Query hackathons directly
      const [hackathons] = await sequelize.query('SELECT * FROM hackathons ORDER BY created_at DESC;');
      console.log(`✅ Found ${hackathons.length} hackathons in database`);
      
      if (hackathons.length > 0) {
        console.log('📋 Recent hackathons:');
        hackathons.slice(0, 5).forEach((hackathon, index) => {
          console.log(`${index + 1}. ${hackathon.name} (ID: ${hackathon.id})`);
          console.log(`   Status: ${hackathon.status}`);
          console.log(`   Published: ${hackathon.is_published}`);
          console.log(`   Created: ${hackathon.created_at}`);
          console.log('   ---');
        });
      } else {
        console.log('ℹ️  No hackathons found in database');
      }
      
      // Check hackathon_participants table
      const [participantCheck] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'hackathon_participants'
        );
      `);
      
      console.log('Hackathon_participants table exists:', participantCheck[0].exists);
      
      if (participantCheck[0].exists) {
        const [participants] = await sequelize.query('SELECT * FROM hackathon_participants;');
        console.log(`✅ Found ${participants.length} hackathon participants`);
      }
      
    } else {
      console.log('❌ Hackathons table does not exist!');
      console.log('💡 You need to run the migration first');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkHackathonsDirect();
