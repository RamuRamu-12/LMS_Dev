#!/usr/bin/env node

/**
 * MIGRATION RUNNER SCRIPT
 * 
 * This script provides an easy interface to run database migrations.
 * It automatically detects the best migration method based on your setup.
 * 
 * Usage: node run-migration.js
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function runMigration() {
  try {
    log('🚀 DATABASE MIGRATION RUNNER', 'bright');
    log('═══════════════════════════════════════════════════════════════');
    
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      logWarning('No .env file found. Running fresh database setup...');
      const { execSync } = require('child_process');
      execSync('node setup-fresh-database.js', { stdio: 'inherit' });
      return;
    }
    
    // Load environment variables
    require('dotenv').config({ path: envPath });
    
    // Check if new database credentials are provided
    const hasNewCredentials = process.env.NEW_DB_HOST && 
                             process.env.NEW_DB_USER && 
                             process.env.NEW_DB_PASSWORD && 
                             process.env.NEW_DB_NAME;
    
    if (hasNewCredentials) {
      logInfo('New database credentials found. Running simple migration...');
      const { execSync } = require('child_process');
      execSync('node migrate-database-simple.js', { stdio: 'inherit' });
    } else {
      logInfo('No new database credentials found. Running interactive migration...');
      const { execSync } = require('child_process');
      execSync('node migrate-to-fresh-db.js', { stdio: 'inherit' });
    }
    
    logSuccess('Migration completed successfully!');
    
  } catch (error) {
    logError(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = runMigration;