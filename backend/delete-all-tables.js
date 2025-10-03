require('dotenv').config();
const { sequelize } = require('./models');

/**
 * DELETE ALL TABLES SCRIPT
 * 
 * ⚠️  WARNING: This will DELETE ALL tables and data!
 * 
 * This script ONLY deletes - it doesn't create anything
 * Use this when you want to completely clean your database
 * 
 * Usage: node delete-all-tables.js
 */

async function deleteAllTables() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   ⚠️  DELETE ALL TABLES - DESTRUCTIVE OPERATION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');
  console.log('⚠️  WARNING: This will DELETE ALL tables and data!\n');
  console.log('⚠️  This action CANNOT be undone!\n');
  console.log('⚠️  Starting in 3 seconds... (Press Ctrl+C to cancel)\n');

  // Give user time to cancel
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // Display current configuration
    console.log('📋 Database Configuration (from .env):\n');
    console.log(`   Database: ${process.env.DB_DATABASE || process.env.DB_NAME || 'Not set'}`);
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || '5432'}`);
    console.log(`   User: ${process.env.DB_USER || 'Not set'}`);
    console.log('\n');

    // Step 1: Test database connection
    console.log('📡 Step 1: Testing database connection...');
    await sequelize.authenticate();
    console.log('   ✅ Database connection successful!\n');

    // Step 2: Get list of existing tables
    console.log('📋 Step 2: Checking existing tables...\n');
    
    const [tablesBefore] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    if (tablesBefore.length > 0) {
      console.log(`   Found ${tablesBefore.length} tables to delete:\n`);
      tablesBefore.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
      console.log('\n');
    } else {
      console.log('   ℹ️  No tables found in database (already empty)\n');
      console.log('✅ Database is already clean!\n');
      process.exit(0);
    }

    // Step 3: Delete all tables
    console.log('🗑️  Step 3: Deleting all tables...');
    console.log('   Dropping all tables with CASCADE\n');
    
    await sequelize.drop({ cascade: true });
    
    console.log('   ✅ All tables deleted successfully!\n');

    // Step 4: Verify deletion
    console.log('📊 Step 4: Verifying deletion...\n');
    
    const [tablesAfter] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    if (tablesAfter.length === 0) {
      console.log('   ✅ All tables successfully deleted!\n');
    } else {
      console.log(`   ⚠️  Warning: ${tablesAfter.length} tables still exist\n`);
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ✅ DATABASE DELETION COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    console.log('📝 What was done:\n');
    console.log(`   ✅ Deleted ${tablesBefore.length} tables`);
    console.log('   ✅ All data removed');
    console.log('   ✅ Database is now completely empty\n');
    console.log('📝 Next Steps:\n');
    console.log('   1. Create tables: node fresh-database-setup.js');
    console.log('      OR');
    console.log('   2. Create tables: node setup-database.js');
    console.log('   3. Create admin: node create-admin-user.js');
    console.log('   4. Start server: npm start\n');
    console.log('💡 Your code files are safe! Only database was cleared.\n');

    process.exit(0);
  } catch (error) {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ❌ DELETION FAILED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    console.error('Error:', error.message);
    console.log('\n');
    console.log('💡 Possible Issues:\n');
    console.log('   - Database connection failed');
    console.log('   - Insufficient permissions');
    console.log('   - Database is locked by another process\n');
    console.log('Check your .env file and database connection.\n');

    process.exit(1);
  }
}

// Run the deletion
deleteAllTables();
