const { sequelize } = require('./models');

async function checkHackathonTables() {
  try {
    console.log('🔍 Checking if hackathon tables exist...');
    
    // Check if hackathons table exists
    const [hackathonsTableExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathons'
      );
    `);
    
    console.log('Hackathons table exists:', hackathonsTableExists[0].exists);
    
    // Check if hackathon_participants table exists
    const [participantsTableExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathon_participants'
      );
    `);
    
    console.log('Hackathon_participants table exists:', participantsTableExists[0].exists);
    
    if (!hackathonsTableExists[0].exists || !participantsTableExists[0].exists) {
      console.log('\n❌ Tables are missing! Please run the migration:');
      console.log('node run-hackathon-migration.js');
    } else {
      console.log('\n✅ All hackathon tables exist!');
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  } finally {
    await sequelize.close();
  }
}

checkHackathonTables();
