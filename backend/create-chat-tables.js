const { sequelize } = require('./models');
const { QueryInterface, DataTypes } = require('sequelize');

async function createChatTables() {
  try {
    console.log('Creating chat tables...');
    
    // Import the migration
    const migration = require('./migrations/20241201000003-create-chat-tables');
    
    // Run the migration
    await migration.up(sequelize.getQueryInterface(), DataTypes);
    
    console.log('✅ Chat tables created successfully!');
    console.log('Tables created:');
    console.log('- chat_messages');
    console.log('- chat_participants');
    
  } catch (error) {
    console.error('❌ Error creating chat tables:', error);
  } finally {
    await sequelize.close();
  }
}

createChatTables();
