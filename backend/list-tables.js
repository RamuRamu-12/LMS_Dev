const { sequelize } = require('./models');

async function listAllTables() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.\n');
    
    // Get all tables in the database
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 All tables in the database:');
    console.log('================================');
    
    if (tables.length === 0) {
      console.log('No tables found in the database.');
    } else {
      tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });
    }
    
    console.log(`\nTotal tables: ${tables.length}`);
    
    // Check if our new tables exist
    const groupTableExists = tables.some(t => t.table_name === 'groups');
    const groupMembersTableExists = tables.some(t => t.table_name === 'group_members');
    const hackathonGroupsTableExists = tables.some(t => t.table_name === 'hackathon_groups');
    
    console.log('\n🔍 Table Status Check:');
    console.log('======================');
    console.log(`✅ groups table: ${groupTableExists ? 'EXISTS' : 'MISSING'}`);
    console.log(`✅ group_members table: ${groupMembersTableExists ? 'EXISTS' : 'MISSING'}`);
    console.log(`❓ hackathon_groups table: ${hackathonGroupsTableExists ? 'EXISTS' : 'MISSING (expected)'}`);
    
    if (groupTableExists && groupMembersTableExists) {
      console.log('\n🎉 Groups system is ready! The frontend error should be resolved.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing tables:', error);
    process.exit(1);
  }
}

listAllTables();
