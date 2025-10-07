const { sequelize } = require('./models');
const migration = require('./migrations/20241201000002-create-groups.js');

async function runMigration() {
  try {
    console.log('Starting groups migration...');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Run the migration
    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
    console.log('Groups migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
