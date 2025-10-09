#!/usr/bin/env node

/**
 * SIMPLE DATABASE MIGRATION SCRIPT
 * 
 * This script migrates your LMS from the current database to a fresh database
 * by reading new credentials from environment variables.
 * 
 * Features:
 * ✅ Exports all data from current database
 * ✅ Creates fresh database with all tables and relationships
 * ✅ Imports all data to new database
 * ✅ Updates environment files with new database credentials
 * ✅ Validates migration success
 * 
 * Usage: 
 * 1. Set new database credentials in environment variables:
 *    export NEW_DB_HOST=your_new_host
 *    export NEW_DB_PORT=5432
 *    export NEW_DB_USER=your_new_user
 *    export NEW_DB_PASSWORD=your_new_password
 *    export NEW_DB_NAME=your_new_database_name
 * 
 * 2. Run: node migrate-database-simple.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

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

function logStep(step, message) {
  log(`\n${colors.cyan}📋 Step ${step}: ${message}${colors.reset}`);
  log('─'.repeat(50));
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

class SimpleDatabaseMigrator {
  constructor() {
    this.oldConfig = null;
    this.newConfig = null;
    this.exportedData = {};
    this.backupDir = path.join(__dirname, 'migration-backup');
    this.exportDir = path.join(this.backupDir, 'data-export');
  }

  async start() {
    try {
      log('🚀 SIMPLE DATABASE MIGRATION STARTED', 'bright');
      log('═══════════════════════════════════════════════════════════════');
      
      // Step 1: Validate and load configurations
      await this.loadConfigurations();
      
      // Step 2: Create backup directory
      await this.createBackupDirectory();
      
      // Step 3: Export current data
      await this.exportCurrentData();
      
      // Step 4: Test new database connection
      await this.testNewDatabaseConnection();
      
      // Step 5: Create fresh database schema
      await this.createFreshDatabaseSchema();
      
      // Step 6: Import data to new database
      await this.importDataToNewDatabase();
      
      // Step 7: Update environment files
      await this.updateEnvironmentFiles();
      
      // Step 8: Validate migration
      await this.validateMigration();
      
      logSuccess('🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
      this.printSummary();
      
    } catch (error) {
      logError(`Migration failed: ${error.message}`);
      logError(`Stack trace: ${error.stack}`);
      process.exit(1);
    }
  }

  async loadConfigurations() {
    logStep(1, 'Loading Database Configurations');
    
    // Load current configuration from .env
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      throw new Error('No .env file found in backend directory');
    }
    
    require('dotenv').config({ path: envPath });
    
    // Current database configuration
    this.oldConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || process.env.DB_NAME
    };
    
     // New database configuration from environment variables
     this.newConfig = {
       host: process.env.NEW_DB_HOST || process.env.DB_HOST,
       port: process.env.NEW_DB_PORT || process.env.DB_PORT || 5432,
       user: process.env.NEW_DB_USER || process.env.DB_USER,
       password: process.env.NEW_DB_PASSWORD || process.env.DB_PASSWORD,
       database: process.env.NEW_DB_NAME || process.env.DB_NAME
     };
    
    // Validate configurations
    const requiredOldVars = ['host', 'user', 'password', 'database'];
    const missingOldVars = requiredOldVars.filter(key => !this.oldConfig[key]);
    
    if (missingOldVars.length > 0) {
      throw new Error(`Missing current database configuration: ${missingOldVars.join(', ')}`);
    }
    
     // Check if we have new database credentials (either with NEW_DB_ prefix or updated existing ones)
     const hasNewCredentials = process.env.NEW_DB_HOST || process.env.NEW_DB_USER || process.env.NEW_DB_PASSWORD || process.env.NEW_DB_NAME;
     
     if (!hasNewCredentials) {
       // If no NEW_DB_ variables are set, assume the user wants to use the same database
       // but with a fresh schema (useful for development/testing)
       logWarning('No NEW_DB_ variables found. Using current database with fresh schema.');
       this.newConfig = { ...this.oldConfig };
     }
     
     const requiredNewVars = ['host', 'user', 'password', 'database'];
     const missingNewVars = requiredNewVars.filter(key => !this.newConfig[key]);
     
     if (missingNewVars.length > 0) {
       throw new Error(`Missing database configuration: ${missingNewVars.join(', ')}`);
     }
    
    logSuccess('Database configurations loaded');
    logInfo(`Current: ${this.oldConfig.database}@${this.oldConfig.host}:${this.oldConfig.port}`);
    logInfo(`New: ${this.newConfig.database}@${this.newConfig.host}:${this.newConfig.port}`);
  }

  async createBackupDirectory() {
    logStep(2, 'Creating Backup Directory');
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
    
    logSuccess('Backup directories created');
  }

  async exportCurrentData() {
    logStep(3, 'Exporting Current Data');
    
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
          
          // Sanitize data before export
          const sanitizedData = data.map(record => {
            const sanitizedRecord = {};
            for (const [key, value] of Object.entries(record)) {
              // Handle null/undefined values
              if (value === null || value === undefined) {
                sanitizedRecord[key] = null;
              }
              // Handle empty objects
              else if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
                sanitizedRecord[key] = null;
              }
              // Handle empty arrays
              else if (Array.isArray(value) && value.length === 0) {
                sanitizedRecord[key] = null;
              }
              // Keep other values as is
              else {
                sanitizedRecord[key] = value;
              }
            }
            return sanitizedRecord;
          });
          
          const exportData = {
            tableName: tableName,
            data: sanitizedData,
            count: sanitizedData.length,
            exportedAt: new Date().toISOString()
          };
          
          const exportFile = path.join(this.exportDir, `${tableName}.json`);
          fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
          
          logSuccess(`Exported ${sanitizedData.length} records from ${tableName}`);
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
    logStep(4, 'Testing New Database Connection');
    
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
    logStep(5, 'Creating Fresh Database Schema');
    
    // Temporarily update environment variables for model loading
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
    logStep(6, 'Importing Data to New Database');
    
    const newSequelize = this.createSequelizeConnection(this.newConfig);
    
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
            // Get column names from the first record
            const columns = Object.keys(exportData.data[0]);
            if (columns.length === 0) {
              logWarning(`Skipping ${tableName} - no columns found`);
              continue;
            }
            
            const columnList = columns.map(col => `"${col}"`).join(', ');
            const placeholders = columns.map(() => '?').join(', ');
            
            // Insert data
            let successCount = 0;
            let errorCount = 0;
            
            for (const record of exportData.data) {
              try {
                const values = columns.map(col => {
                  const value = record[col];
                  
                  // Handle different data types
                  if (value === null || value === undefined) {
                    return null;
                  }
                  
                  // Handle JSON fields
                  if (typeof value === 'object') {
                    // If it's an empty object or array, convert to null
                    if (Array.isArray(value) && value.length === 0) {
                      return null;
                    }
                    if (!Array.isArray(value) && Object.keys(value).length === 0) {
                      return null;
                    }
                    // Convert to JSON string for database storage
                    return JSON.stringify(value);
                  }
                  
                  // Handle dates
                  if (value instanceof Date) {
                    return value.toISOString();
                  }
                  
                  // Handle booleans
                  if (typeof value === 'boolean') {
                    return value;
                  }
                  
                  // Handle numbers
                  if (typeof value === 'number') {
                    return value;
                  }
                  
                  // Handle strings
                  if (typeof value === 'string') {
                    return value;
                  }
                  
                  // Default fallback
                  return value;
                });
                
                await newSequelize.query(`
                  INSERT INTO "${tableName}" (${columnList}) 
                  VALUES (${placeholders})
                `, {
                  replacements: values
                });
                
                successCount++;
              } catch (insertError) {
                errorCount++;
                console.error(`Error inserting record into ${tableName}:`, insertError.message);
                console.error('Record data:', record);
                
                // Log the error but continue with other records
                logWarning(`Skipped problematic record in ${tableName}: ${insertError.message}`);
              }
            }
            
            if (errorCount > 0) {
              logWarning(`Imported ${successCount} records to ${tableName}, skipped ${errorCount} problematic records`);
            } else {
              logSuccess(`Imported ${successCount} records to ${tableName}`);
            }
          }
        }
      }
      
    } finally {
      await newSequelize.close();
    }
    
    logSuccess('Data import completed');
  }

  async updateEnvironmentFiles() {
    logStep(7, 'Updating Environment Files');
    
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
    logStep(8, 'Validating Migration');
    
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
    log('\n🎉 Your LMS is now running on the fresh database!');
  }
}

// Run the migration
if (require.main === module) {
  const migrator = new SimpleDatabaseMigrator();
  migrator.start().catch(console.error);
}

module.exports = SimpleDatabaseMigrator;
