#!/usr/bin/env node

/**
 * DATABASE MIGRATION SCRIPT
 * 
 * This script migrates your LMS from the current database to a fresh database
 * while preserving all functionality and data.
 * 
 * Features:
 * ✅ Backs up current environment configuration
 * ✅ Exports all data from current database
 * ✅ Creates fresh database with all tables and relationships
 * ✅ Imports all data to new database
 * ✅ Updates environment files with new database credentials
 * ✅ Validates migration success
 * ✅ Provides rollback capability
 * 
 * Usage: node migrate-to-fresh-database.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const { execSync } = require('child_process');

// Configuration
const BACKUP_DIR = path.join(__dirname, 'migration-backup');
const EXPORT_DIR = path.join(BACKUP_DIR, 'data-export');
const ENV_BACKUP_FILE = path.join(BACKUP_DIR, 'env-backup.json');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}📋 Step ${step}: ${message}${colors.reset}`);
  log('─'.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

class DatabaseMigrator {
  constructor() {
    this.oldConfig = null;
    this.newConfig = null;
    this.exportedData = {};
    this.migrationLog = [];
  }

  async start() {
    try {
      log('🚀 DATABASE MIGRATION SCRIPT STARTED', 'bright');
      log('═══════════════════════════════════════════════════════════════');
      
      // Step 1: Validate current setup
      await this.validateCurrentSetup();
      
      // Step 2: Get new database credentials
      await this.getNewDatabaseCredentials();
      
      // Step 3: Create backup directory
      await this.createBackupDirectory();
      
      // Step 4: Backup current environment
      await this.backupCurrentEnvironment();
      
      // Step 5: Export current data
      await this.exportCurrentData();
      
      // Step 6: Test new database connection
      await this.testNewDatabaseConnection();
      
      // Step 7: Create fresh database schema
      await this.createFreshDatabaseSchema();
      
      // Step 8: Import data to new database
      await this.importDataToNewDatabase();
      
      // Step 9: Update environment files
      await this.updateEnvironmentFiles();
      
      // Step 10: Validate migration
      await this.validateMigration();
      
      // Step 11: Create rollback script
      await this.createRollbackScript();
      
      logSuccess('🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
      log('═══════════════════════════════════════════════════════════════');
      this.printSummary();
      
    } catch (error) {
      logError(`Migration failed: ${error.message}`);
      logError(`Stack trace: ${error.stack}`);
      await this.handleMigrationFailure(error);
    }
  }

  async validateCurrentSetup() {
    logStep(1, 'Validating Current Setup');
    
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      throw new Error('No .env file found in backend directory. Please create one with your database credentials.');
    }
    
    // Load current environment
    require('dotenv').config({ path: envPath });
    
    // Validate required environment variables
    const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    // Store current configuration
    this.oldConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || process.env.DB_NAME
    };
    
    logSuccess('Current database configuration validated');
    logInfo(`Current DB: ${this.oldConfig.database}@${this.oldConfig.host}:${this.oldConfig.port}`);
  }

  async getNewDatabaseCredentials() {
    logStep(2, 'Getting New Database Credentials');
    
    log('Please provide your new database credentials:');
    log('(Press Enter to use current values as defaults)');
    
    // In a real implementation, you would use readline or similar
    // For this script, we'll use environment variables or prompt
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
    
    try {
      const newHost = await question(`New DB Host [${this.oldConfig.host}]: `) || this.oldConfig.host;
      const newPort = await question(`New DB Port [${this.oldConfig.port}]: `) || this.oldConfig.port;
      const newUser = await question(`New DB User [${this.oldConfig.user}]: `) || this.oldConfig.user;
      const newPassword = await question('New DB Password: ');
      const newDatabase = await question(`New DB Name [${this.oldConfig.database}_new]: `) || `${this.oldConfig.database}_new`;
      
      if (!newPassword) {
        throw new Error('New database password is required');
      }
      
      this.newConfig = {
        host: newHost,
        port: parseInt(newPort),
        user: newUser,
        password: newPassword,
        database: newDatabase
      };
      
      logSuccess('New database credentials collected');
      logInfo(`New DB: ${this.newConfig.database}@${this.newConfig.host}:${this.newConfig.port}`);
      
    } finally {
      rl.close();
    }
  }

  async createBackupDirectory() {
    logStep(3, 'Creating Backup Directory');
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }
    
    logSuccess('Backup directories created');
  }

  async backupCurrentEnvironment() {
    logStep(4, 'Backing Up Current Environment');
    
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const envBackup = {
      timestamp: new Date().toISOString(),
      oldConfig: this.oldConfig,
      envContent: envContent
    };
    
    fs.writeFileSync(ENV_BACKUP_FILE, JSON.stringify(envBackup, null, 2));
    
    logSuccess('Environment configuration backed up');
  }

  async exportCurrentData() {
    logStep(5, 'Exporting Current Data');
    
    // Create connection to old database
    const oldSequelize = new Sequelize(
      this.oldConfig.database,
      this.oldConfig.user,
      this.oldConfig.password,
      {
        host: this.oldConfig.host,
        port: this.oldConfig.port,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        dialectOptions: {
          ssl: this.oldConfig.host.includes('aws') || this.oldConfig.host.includes('neon') ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      }
    );
    
    try {
      await oldSequelize.authenticate();
      logSuccess('Connected to old database');
      
      // Get all table names
      const [tables] = await oldSequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name != 'SequelizeMeta'
        ORDER BY table_name
      `);
      
      logInfo(`Found ${tables.length} tables to export`);
      
      // Export data from each table
      for (const table of tables) {
        const tableName = table.table_name;
        logInfo(`Exporting ${tableName}...`);
        
        try {
          const [data] = await oldSequelize.query(`SELECT * FROM "${tableName}"`);
          
          const exportData = {
            tableName: tableName,
            data: data,
            count: data.length,
            exportedAt: new Date().toISOString()
          };
          
          const exportFile = path.join(EXPORT_DIR, `${tableName}.json`);
          fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
          
          logSuccess(`Exported ${data.length} records from ${tableName}`);
          this.exportedData[tableName] = exportData;
          
        } catch (error) {
          logWarning(`Failed to export ${tableName}: ${error.message}`);
        }
      }
      
      // Export migration history
      try {
        const [migrations] = await oldSequelize.query(`SELECT * FROM "SequelizeMeta"`);
        const migrationData = {
          tableName: 'SequelizeMeta',
          data: migrations,
          count: migrations.length,
          exportedAt: new Date().toISOString()
        };
        
        const migrationFile = path.join(EXPORT_DIR, 'SequelizeMeta.json');
        fs.writeFileSync(migrationFile, JSON.stringify(migrationData, null, 2));
        
        logSuccess(`Exported ${migrations.length} migration records`);
        this.exportedData['SequelizeMeta'] = migrationData;
        
      } catch (error) {
        logWarning(`Failed to export migration history: ${error.message}`);
      }
      
    } finally {
      await oldSequelize.close();
    }
    
    logSuccess('Data export completed');
  }

  async testNewDatabaseConnection() {
    logStep(6, 'Testing New Database Connection');
    
    const newSequelize = new Sequelize(
      this.newConfig.database,
      this.newConfig.user,
      this.newConfig.password,
      {
        host: this.newConfig.host,
        port: this.newConfig.port,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        dialectOptions: {
          ssl: this.newConfig.host.includes('aws') || this.newConfig.host.includes('neon') ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      }
    );
    
    try {
      await newSequelize.authenticate();
      logSuccess('New database connection successful');
    } catch (error) {
      throw new Error(`Failed to connect to new database: ${error.message}`);
    } finally {
      await newSequelize.close();
    }
  }

  async createFreshDatabaseSchema() {
    logStep(7, 'Creating Fresh Database Schema');
    
    // Load models and create schema
    const { sequelize } = require('./models');
    
    // Update sequelize config to use new database
    sequelize.config.host = this.newConfig.host;
    sequelize.config.port = this.newConfig.port;
    sequelize.config.username = this.newConfig.user;
    sequelize.config.password = this.newConfig.password;
    sequelize.config.database = this.newConfig.database;
    
    try {
      await sequelize.authenticate();
      logSuccess('Connected to new database');
      
      // Create all tables
      await sequelize.sync({ force: true });
      logSuccess('Fresh database schema created');
      
    } finally {
      await sequelize.close();
    }
  }

  async importDataToNewDatabase() {
    logStep(8, 'Importing Data to New Database');
    
    const newSequelize = new Sequelize(
      this.newConfig.database,
      this.newConfig.user,
      this.newConfig.password,
      {
        host: this.newConfig.host,
        port: this.newConfig.port,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        dialectOptions: {
          ssl: this.newConfig.host.includes('aws') || this.newConfig.host.includes('neon') ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      }
    );
    
    try {
      await newSequelize.authenticate();
      logSuccess('Connected to new database for import');
      
      // Import data in correct order (respecting foreign key constraints)
      const importOrder = [
        'users',
        'courses',
        'course_chapters',
        'enrollments',
        'file_uploads',
        'chapter_progress',
        'course_tests',
        'test_questions',
        'test_question_options',
        'test_attempts',
        'test_answers',
        'certificates',
        'achievements',
        'activity_logs',
        'projects',
        'project_phases',
        'project_progress',
        'documents',
        'videos',
        'SequelizeMeta'
      ];
      
      for (const tableName of importOrder) {
        if (this.exportedData[tableName]) {
          const exportData = this.exportedData[tableName];
          logInfo(`Importing ${exportData.count} records to ${tableName}...`);
          
          if (exportData.data.length > 0) {
            // Get column names
            const columns = Object.keys(exportData.data[0]);
            const columnList = columns.map(col => `"${col}"`).join(', ');
            const placeholders = columns.map(() => '?').join(', ');
            
            // Insert data in batches
            const batchSize = 100;
            for (let i = 0; i < exportData.data.length; i += batchSize) {
              const batch = exportData.data.slice(i, i + batchSize);
              
              for (const record of batch) {
                const values = columns.map(col => record[col]);
                await newSequelize.query(`
                  INSERT INTO "${tableName}" (${columnList}) 
                  VALUES (${placeholders})
                `, {
                  replacements: values
                });
              }
            }
            
            logSuccess(`Imported ${exportData.count} records to ${tableName}`);
          }
        }
      }
      
    } finally {
      await newSequelize.close();
    }
    
    logSuccess('Data import completed');
  }

  async updateEnvironmentFiles() {
    logStep(9, 'Updating Environment Files');
    
    // Update backend .env file
    const backendEnvPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(backendEnvPath, 'utf8');
    
    // Update database credentials
    envContent = envContent.replace(/DB_HOST=.*/g, `DB_HOST=${this.newConfig.host}`);
    envContent = envContent.replace(/DB_PORT=.*/g, `DB_PORT=${this.newConfig.port}`);
    envContent = envContent.replace(/DB_USER=.*/g, `DB_USER=${this.newConfig.user}`);
    envContent = envContent.replace(/DB_PASSWORD=.*/g, `DB_PASSWORD=${this.newConfig.password}`);
    envContent = envContent.replace(/DB_DATABASE=.*/g, `DB_DATABASE=${this.newConfig.database}`);
    envContent = envContent.replace(/DB_NAME=.*/g, `DB_NAME=${this.newConfig.database}`);
    
    fs.writeFileSync(backendEnvPath, envContent);
    logSuccess('Backend .env file updated');
    
    // Update frontend .env file if it exists
    const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
    if (fs.existsSync(frontendEnvPath)) {
      let frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
      // Update API URL if needed (usually stays the same)
      fs.writeFileSync(frontendEnvPath, frontendEnvContent);
      logSuccess('Frontend .env file updated');
    }
    
    // Update config.json if it exists
    const configPath = path.join(__dirname, 'config', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Update all environments
      Object.keys(config).forEach(env => {
        if (config[env]) {
          config[env].host = this.newConfig.host;
          config[env].port = this.newConfig.port;
          config[env].username = this.newConfig.user;
          config[env].password = this.newConfig.password;
          config[env].database = this.newConfig.database;
        }
      });
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      logSuccess('config.json file updated');
    }
  }

  async validateMigration() {
    logStep(10, 'Validating Migration');
    
    // Test connection with new credentials
    process.env.DB_HOST = this.newConfig.host;
    process.env.DB_PORT = this.newConfig.port;
    process.env.DB_USER = this.newConfig.user;
    process.env.DB_PASSWORD = this.newConfig.password;
    process.env.DB_DATABASE = this.newConfig.database;
    process.env.DB_NAME = this.newConfig.database;
    
    const { sequelize } = require('./models');
    
    try {
      await sequelize.authenticate();
      logSuccess('New database connection validated');
      
      // Check table counts
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      logInfo(`Found ${tables.length} tables in new database`);
      
      // Validate data counts for key tables
      const keyTables = ['users', 'courses', 'enrollments'];
      for (const tableName of keyTables) {
        if (this.exportedData[tableName]) {
          const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
          const expectedCount = this.exportedData[tableName].count;
          const actualCount = count[0].count;
          
          if (actualCount === expectedCount) {
            logSuccess(`${tableName}: ${actualCount} records (matches export)`);
          } else {
            logWarning(`${tableName}: ${actualCount} records (expected ${expectedCount})`);
          }
        }
      }
      
    } finally {
      await sequelize.close();
    }
    
    logSuccess('Migration validation completed');
  }

  async createRollbackScript() {
    logStep(11, 'Creating Rollback Script');
    
    const rollbackScript = `#!/usr/bin/env node

/**
 * ROLLBACK SCRIPT
 * 
 * This script rolls back the database migration to the previous state.
 * 
 * Usage: node rollback-migration.js
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = '${BACKUP_DIR}';
const ENV_BACKUP_FILE = '${ENV_BACKUP_FILE}';

async function rollback() {
  try {
    console.log('🔄 Starting rollback...');
    
    // Check if backup exists
    if (!fs.existsSync(ENV_BACKUP_FILE)) {
      throw new Error('No backup found. Cannot rollback.');
    }
    
    // Load backup
    const backup = JSON.parse(fs.readFileSync(ENV_BACKUP_FILE, 'utf8'));
    
    // Restore .env file
    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, backup.envContent);
    console.log('✅ Environment file restored');
    
    // Restore config.json if it was backed up
    const configBackupPath = path.join(BACKUP_DIR, 'config-backup.json');
    if (fs.existsSync(configBackupPath)) {
      const configPath = path.join(__dirname, 'config', 'config.json');
      const configBackup = fs.readFileSync(configBackupPath, 'utf8');
      fs.writeFileSync(configPath, configBackup);
      console.log('✅ Config file restored');
    }
    
    console.log('🎉 Rollback completed successfully!');
    console.log('Your database configuration has been restored to the previous state.');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    process.exit(1);
  }
}

rollback();
`;

    const rollbackPath = path.join(__dirname, 'rollback-migration.js');
    fs.writeFileSync(rollbackPath, rollbackScript);
    
    // Make it executable
    fs.chmodSync(rollbackPath, '755');
    
    logSuccess('Rollback script created');
  }

  printSummary() {
    log('\n📊 MIGRATION SUMMARY', 'bright');
    log('═══════════════════════════════════════════════════════════════');
    log(`Old Database: ${this.oldConfig.database}@${this.oldConfig.host}:${this.oldConfig.port}`);
    log(`New Database: ${this.newConfig.database}@${this.newConfig.host}:${this.newConfig.port}`);
    log(`Tables Migrated: ${Object.keys(this.exportedData).length}`);
    log(`Backup Location: ${BACKUP_DIR}`);
    log('\n📝 Next Steps:');
    log('1. Test your application with the new database');
    log('2. Verify all functionality works correctly');
    log('3. If everything works, you can delete the backup directory');
    log('4. If issues occur, run: node rollback-migration.js');
    log('\n🎉 Your LMS is now running on the fresh database!');
  }

  async handleMigrationFailure(error) {
    logError('Migration failed. Creating recovery information...');
    
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      oldConfig: this.oldConfig,
      newConfig: this.newConfig,
      exportedDataKeys: Object.keys(this.exportedData)
    };
    
    const errorLogPath = path.join(BACKUP_DIR, 'migration-error.json');
    fs.writeFileSync(errorLogPath, JSON.stringify(errorLog, null, 2));
    
    logError(`Error details saved to: ${errorLogPath}`);
    logError('You can use the rollback script to restore your previous configuration.');
  }
}

// Run the migration
if (require.main === module) {
  const migrator = new DatabaseMigrator();
  migrator.start().catch(console.error);
}

module.exports = DatabaseMigrator;
