const { sequelize } = require('./models');

async function runHackathonMigration() {
  try {
    console.log('Starting hackathon migration...');
    
    // Import the migration
    const migration = require('./migrations/035-create-hackathons');
    
    // Run the migration
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('✅ Hackathon migration completed successfully!');
    console.log('Created tables: hackathons, hackathon_participants');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runHackathonMigration();
