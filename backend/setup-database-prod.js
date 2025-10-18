require('dotenv').config();
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

/**
 * PRODUCTION DATABASE SETUP
 * 
 * ✅ SAFE - Uses migrations only
 * ✅ Preserves all data
 * ✅ Reversible changes
 * ✅ Version controlled
 * 
 * This script runs migrations to update the database schema
 * WITHOUT losing any data.
 * 
 * Usage: node setup-database-prod.js
 */

async function setupProductionDatabase() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🏭 PRODUCTION DATABASE SETUP');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');

  try {
    // Display current configuration
    console.log('📋 Environment: PRODUCTION\n');
    console.log('   Database:', process.env.DB_DATABASE || process.env.DB_NAME || 'Not set');
    console.log('   Host:', process.env.DB_HOST || 'Not set');
    console.log('   Port:', process.env.DB_PORT || '5432');
    console.log('\n');

    // Safety confirmation
    console.log('⚠️  PRODUCTION MODE - Running migrations safely');
    console.log('   - Migrations preserve existing data');
    console.log('   - Changes are version controlled');
    console.log('   - Rollback available if needed\n');
    
    console.log('   Starting in 3 seconds... (Ctrl+C to cancel)\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Run migrations
    console.log('🔄 Running database migrations...\n');
    
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate', {
      cwd: __dirname,
      env: { ...process.env, NODE_ENV: 'production' }
    });

    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr && !stderr.includes('Executing')) {
      console.error('⚠️  Warnings:', stderr);
    }

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ✅ PRODUCTION DATABASE UPDATED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    console.log('📝 What happened:\n');
    console.log('   ✅ All pending migrations applied');
    console.log('   ✅ Database schema updated');
    console.log('   ✅ All existing data preserved\n');
    console.log('💡 To rollback last migration: npx sequelize-cli db:migrate:undo\n');

    process.exit(0);
  } catch (error) {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ❌ MIGRATION FAILED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    console.error('Error:', error.message);
    if (error.stdout) {
      console.log('\nOutput:', error.stdout);
    }
    if (error.stderr) {
      console.error('\nError output:', error.stderr);
    }
    console.log('\n');
    console.log('💡 Troubleshooting:\n');
    console.log('   1. Check database connection');
    console.log('   2. Review migration files for errors');
    console.log('   3. Check SequelizeMeta table for applied migrations');
    console.log('   4. Rollback if needed: npx sequelize-cli db:migrate:undo\n');

    process.exit(1);
  }
}

// Run setup
setupProductionDatabase();

