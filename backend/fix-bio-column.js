const { sequelize } = require('./models');

async function fixBioColumn() {
  try {
    console.log('🔍 Checking current users table structure...');
    
    // Check if bio column exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('bio', 'phone', 'location')
      ORDER BY column_name
    `);
    
    console.log('📋 Existing profile columns:', results.map(r => r.column_name));
    
    // Add missing columns
    const missingColumns = [];
    const existingColumns = results.map(r => r.column_name);
    
    if (!existingColumns.includes('bio')) {
      missingColumns.push('bio');
    }
    if (!existingColumns.includes('phone')) {
      missingColumns.push('phone');
    }
    if (!existingColumns.includes('location')) {
      missingColumns.push('location');
    }
    
    if (missingColumns.length === 0) {
      console.log('✅ All profile columns already exist!');
      return;
    }
    
    console.log(`🔧 Adding missing columns: ${missingColumns.join(', ')}`);
    
    for (const column of missingColumns) {
      let columnType;
      switch (column) {
        case 'bio':
          columnType = 'TEXT';
          break;
        case 'phone':
          columnType = 'VARCHAR(20)';
          break;
        case 'location':
          columnType = 'VARCHAR(255)';
          break;
      }
      
      await sequelize.query(`ALTER TABLE users ADD COLUMN ${column} ${columnType}`);
      console.log(`✅ Added column: ${column}`);
    }
    
    console.log('🎉 Successfully added all missing profile columns!');
    
  } catch (error) {
    console.error('❌ Error fixing bio column:', error.message);
    throw error;
  }
}

// Run the fix
fixBioColumn()
  .then(() => {
    console.log('✨ Database schema fixed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to fix database schema:', error.message);
    process.exit(1);
  });
