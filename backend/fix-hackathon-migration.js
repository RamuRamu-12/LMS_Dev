const { sequelize } = require('./models');

async function fixHackathonMigration() {
  try {
    console.log('🔧 Fixing hackathon migration...');
    
    // Check if tables exist first
    const [hackathonsExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathons'
      );
    `);
    
    const [participantsExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathon_participants'
      );
    `);
    
    console.log('Hackathons table exists:', hackathonsExists[0].exists);
    console.log('Hackathon_participants table exists:', participantsExists[0].exists);
    
    if (hackathonsExists[0].exists && participantsExists[0].exists) {
      console.log('✅ Both tables already exist! Migration not needed.');
      console.log('🎉 Hackathon feature is ready to use!');
    } else {
      console.log('⚠️  Some tables are missing. Running sync to create them...');
      
      // Use sync to create missing tables
      await sequelize.sync({ alter: true });
      console.log('✅ Tables synced successfully!');
    }
    
    // Test the models
    const { Hackathon, HackathonParticipant } = require('./models');
    const hackathonCount = await Hackathon.count();
    const participantCount = await HackathonParticipant.count();
    
    console.log(`✅ Models working - Hackathons: ${hackathonCount}, Participants: ${participantCount}`);
    
    console.log('\n🎉 Hackathon feature is now ready!');
    console.log('You can now:');
    console.log('1. Start your backend server');
    console.log('2. Create hackathons from the admin interface');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixHackathonMigration();
