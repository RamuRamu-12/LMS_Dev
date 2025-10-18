require('dotenv').config();
const { sequelize } = require('./models');

/**
 * DEVELOPMENT DATABASE SETUP
 * 
 * ✅ Safe for development - Uses sequelize.sync()
 * ✅ Automatically creates/updates tables from models
 * ✅ Fast iteration - Just update models and run this
 * ⚠️  WARNING: Use 'force: true' only when you want fresh start
 * 
 * Usage: 
 *   node setup-database-dev.js          (safe - keeps data)
 *   node setup-database-dev.js --fresh  (dangerous - loses data)
 */

async function setupDevelopmentDatabase() {
  const isFreshStart = process.argv.includes('--fresh');
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🔧 DEVELOPMENT DATABASE SETUP');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');

  try {
    // Display current configuration
    console.log('📋 Environment: DEVELOPMENT\n');
    console.log('   Database:', process.env.DB_DATABASE || process.env.DB_NAME || 'Not set');
    console.log('   Host:', process.env.DB_HOST || 'localhost');
    console.log('   Port:', process.env.DB_PORT || '5432');
    console.log('   User:', process.env.DB_USER || 'Not set');
    console.log('\n');

    // Test connection
    console.log('📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('   ✅ Connected successfully!\n');

    if (isFreshStart) {
      console.log('⚠️  FRESH START MODE - All data will be lost!');
      console.log('   Waiting 3 seconds... (Ctrl+C to cancel)\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔄 Dropping and recreating all tables...');
      await sequelize.sync({ force: true });
      console.log('   ✅ All tables recreated (fresh start)\n');
    } else {
      console.log('🔄 Syncing database schema (safe mode)...');
      console.log('   - Creates missing tables');
      console.log('   - Keeps existing data');
      console.log('   - Does NOT alter existing columns\n');
      
      await sequelize.sync({ force: false });
      console.log('   ✅ Database synced (data preserved)\n');
    }

    // Get table list
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`📊 Database contains ${tables.length} tables:\n`);
    tables.forEach((table, index) => {
      console.log(`   ${(index + 1).toString().padStart(2)}. ${table.table_name}`);
    });

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ✅ DEVELOPMENT DATABASE READY!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    console.log('📝 Next Steps:\n');
    console.log('   1. (Optional) Create admin: node create-admin-user.js');
    console.log('   2. (Optional) Seed data: node seed-data.js');
    console.log('   3. Start server: npm start\n');
    console.log('💡 To reset database: node setup-database-dev.js --fresh\n');

    process.exit(0);
  } catch (error) {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ❌ SETUP FAILED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    console.log('\n');
    console.log('💡 Troubleshooting:\n');
    console.log('   1. Check .env file has correct credentials');
    console.log('   2. Ensure PostgreSQL is running');
    console.log('   3. Verify database exists');
    console.log('   4. Check database permissions\n');

    process.exit(1);
  }
}

// Run setup
setupDevelopmentDatabase();

