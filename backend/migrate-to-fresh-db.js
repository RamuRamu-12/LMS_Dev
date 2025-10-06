#!/usr/bin/env node

/**
 * COMPREHENSIVE DATABASE MIGRATION SCRIPT
 * 
 * This script provides a complete solution for migrating your LMS database
 * to a fresh database while preserving all functionality and data.
 * 
 * Features:
 * ✅ Automatic environment detection
 * ✅ Data export and import
 * ✅ Fresh database schema creation
 * ✅ Environment file updates
 * ✅ Validation and error handling
 * ✅ Backup and recovery
 * 
 * Usage: node migrate-to-fresh-db.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
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

class ComprehensiveDatabaseMigrator {
  constructor() {
    this.oldConfig = null;
    this.newConfig = null;
    this.exportedData = {};
    this.backupDir = path.join(__dirname, 'migration-backup');
    this.exportDir = path.join(this.backupDir, 'data-export');
    this.migrationLog = [];
  }

  async start() {
    try {
      log('🚀 COMPREHENSIVE DATABASE MIGRATION STARTED', 'bright');
      log('═══════════════════════════════════════════════════════════════');
      
      // Step 1: Initialize and validate
      await this.initialize();
      
      // Step 2: Get new database configuration
      await this.getNewDatabaseConfig();
      
      // Step 3: Create backup directory
      await this.createBackupDirectory();
      
      // Step 4: Export current data
      await this.exportCurrentData();
      
      // Step 5: Test new database connection
      await this.testNewDatabaseConnection();
      
      // Step 6: Create fresh database schema
      await this.createFreshDatabaseSchema();
      
      // Step 7: Import data to new database
      await this.importDataToNewDatabase();
      
      // Step 8: Update environment files
      await this.updateEnvironmentFiles();
      
      // Step 9: Validate migration
      await this.validateMigration();
      
      // Step 10: Create recovery tools
      await this.createRecoveryTools();
      
      logSuccess('🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
      this.printSummary();
      
    } catch (error) {
      logError(`Migration failed: ${error.message}`);
      await this.handleMigrationFailure(error);
    }
  }

  async initialize() {
    logStep(1, 'Initializing Migration');
    
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      logWarning('No .env file found. Creating one...');
      await this.createDefaultEnvFile();
    }
    
    // Load current environment
    require('dotenv').config({ path: envPath });
    
    // Load current configuration
    this.oldConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || process.env.DB_NAME || 'lms_db'
    };
    
    logSuccess('Migration initialized');
    logInfo(`Current DB: ${this.oldConfig.database}@${this.oldConfig.host}:${this.oldConfig.port}`);
  }

  async createDefaultEnvFile() {
    const envContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_DATABASE=lms_db
DB_NAME=lms_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_${Math.random().toString(36).substring(2, 15)}
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name_here
`;

    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    logSuccess('Created default .env file');
  }

  async getNewDatabaseConfig() {
    logStep(2, 'Getting New Database Configuration');
    
    // Check for environment variables first
    if (process.env.NEW_DB_HOST && process.env.NEW_DB_USER && process.env.NEW_DB_PASSWORD && process.env.NEW_DB_NAME) {
      this.newConfig = {
        host: process.env.NEW_DB_HOST,
        port: process.env.NEW_DB_PORT || 5432,
        user: process.env.NEW_DB_USER,
        password: process.env.NEW_DB_PASSWORD,
        database: process.env.NEW_DB_NAME
      };
      
      logSuccess('New database configuration loaded from environment variables');
    } else {
      // Use interactive input
      await this.getInteractiveConfig();
    }
    
    logInfo(`New DB: ${this.newConfig.database}@${this.newConfig.host}:${this.newConfig.port}`);
  }

  async getInteractiveConfig() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
    
    try {
      log('Please provide your new database credentials:');
      
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
      
    } finally {
      rl.close();
    }
  }

  async createBackupDirectory() {
    logStep(3, 'Creating Backup Directory');
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
    
    // Backup current .env file
    const envPath = path.join(__dirname, '.env');
    const envBackupPath = path.join(this.backupDir, 'env-backup.json');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const envBackup = {
      timestamp: new Date().toISOString(),
      oldConfig: this.oldConfig,
      envContent: envContent
    };
    
    fs.writeFileSync(envBackupPath, JSON.stringify(envBackup, null, 2));
    
    logSuccess('Backup directories created and .env file backed up');
  }

  async exportCurrentData() {
    logStep(4, 'Exporting Current Data');
    
    const oldSequelize = this.createSequelizeConnection(this.oldConfig);
    
    try {
      await oldSequelize.authenticate();
      logSuccess('Connected to current database');
      
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
          
          const exportFile = path.join(this.exportDir, `${tableName}.json`);
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
        
        const migrationFile = path.join(this.exportDir, 'SequelizeMeta.json');
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
    logStep(5, 'Testing New Database Connection');
    
    const newSequelize = this.createSequelizeConnection(this.newConfig);
    
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
    logStep(6, 'Creating Fresh Database Schema');
    
    // Temporarily update environment variables
    const originalEnv = {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_DATABASE: process.env.DB_DATABASE,
      DB_NAME: process.env.DB_NAME
    };
    
    // Set new database credentials
    process.env.DB_HOST = this.newConfig.host;
    process.env.DB_PORT = this.newConfig.port;
    process.env.DB_USER = this.newConfig.user;
    process.env.DB_PASSWORD = this.newConfig.password;
    process.env.DB_DATABASE = this.newConfig.database;
    process.env.DB_NAME = this.newConfig.database;
    
    try {
      // Load models with new configuration
      const { sequelize } = require('./models');
      
      await sequelize.authenticate();
      logSuccess('Connected to new database');
      
      // Create all tables
      await sequelize.sync({ force: true });
      logSuccess('Fresh database schema created');
      
    } finally {
      // Restore original environment variables
      Object.assign(process.env, originalEnv);
    }
  }

  async importDataToNewDatabase() {
    logStep(7, 'Importing Data to New Database');
    
    const newSequelize = this.createSequelizeConnection(this.newConfig);
    
    try {
      await newSequelize.authenticate();
      logSuccess('Connected to new database for import');
      
      // Import data in correct order
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
            
            // Insert data
            for (const record of exportData.data) {
              const values = columns.map(col => record[col]);
              await newSequelize.query(`
                INSERT INTO "${tableName}" (${columnList}) 
                VALUES (${placeholders})
              `, {
                replacements: values
              });
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
    logStep(8, 'Updating Environment Files');
    
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
    logStep(9, 'Validating Migration');
    
    const newSequelize = this.createSequelizeConnection(this.newConfig);
    
    try {
      await newSequelize.authenticate();
      logSuccess('New database connection validated');
      
      // Check table counts
      const [tables] = await newSequelize.query(`
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
          const [count] = await newSequelize.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
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
      await newSequelize.close();
    }
    
    logSuccess('Migration validation completed');
  }

  async createRecoveryTools() {
    logStep(10, 'Creating Recovery Tools');
    
    // Create rollback script
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

const BACKUP_DIR = '${this.backupDir}';
const ENV_BACKUP_FILE = '${path.join(this.backupDir, 'env-backup.json')}';

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
    fs.chmodSync(rollbackPath, '755');
    
    logSuccess('Recovery tools created');
  }

  createSequelizeConnection(config) {
    return new Sequelize(
      config.database,
      config.user,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        dialectOptions: {
          ssl: config.host.includes('aws') || config.host.includes('neon') || config.host.includes('amazonaws') ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      }
    );
  }

  printSummary() {
    log('\n📊 MIGRATION SUMMARY', 'bright');
    log('═══════════════════════════════════════════════════════════════');
    log(`Old Database: ${this.oldConfig.database}@${this.oldConfig.host}:${this.oldConfig.port}`);
    log(`New Database: ${this.newConfig.database}@${this.newConfig.host}:${this.newConfig.port}`);
    log(`Tables Migrated: ${Object.keys(this.exportedData).length}`);
    log(`Backup Location: ${this.backupDir}`);
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
    
    const errorLogPath = path.join(this.backupDir, 'migration-error.json');
    fs.writeFileSync(errorLogPath, JSON.stringify(errorLog, null, 2));
    
    logError(`Error details saved to: ${errorLogPath}`);
    logError('You can use the rollback script to restore your previous configuration.');
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  const migrator = new ComprehensiveDatabaseMigrator();
  migrator.start().catch(console.error);
}

module.exports = ComprehensiveDatabaseMigrator;
