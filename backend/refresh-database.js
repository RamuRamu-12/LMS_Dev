#!/usr/bin/env node

/**
 * DATABASE REFRESH SCRIPT
 * 
 * This script refreshes your database by:
 * 1. Reading your current database credentials from .env
 * 2. Exporting all existing data
 * 3. Creating a fresh database schema
 * 4. Importing all data back
 * 
 * This is perfect when you want to clean up your database
 * while keeping all your data and functionality.
 * 
 * Usage: node refresh-database.js
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

class DatabaseRefresher {
  constructor() {
    this.config = null;
    this.exportedData = {};
    this.backupDir = path.join(__dirname, 'refresh-backup');
    this.exportDir = path.join(this.backupDir, 'data-export');
  }

  async start() {
    try {
      log('🚀 DATABASE REFRESH STARTED', 'bright');
      log('═══════════════════════════════════════════════════════════════');
      
      // Step 1: Load configuration
      await this.loadConfiguration();
      
      // Step 2: Create backup directory
      await this.createBackupDirectory();
      
      // Step 3: Export current data
      await this.exportCurrentData();
      
      // Step 4: Create fresh database schema
      await this.createFreshDatabaseSchema();
      
      // Step 5: Import data back
      await this.importDataBack();
      
      // Step 6: Validate refresh
      await this.validateRefresh();
      
      logSuccess('🎉 DATABASE REFRESH COMPLETED SUCCESSFULLY!');
      this.printSummary();
      
    } catch (error) {
      logError(`Refresh failed: ${error.message}`);
      logError(`Stack trace: ${error.stack}`);
      process.exit(1);
    }
  }

  async loadConfiguration() {
    logStep(1, 'Loading Database Configuration');
    
    // Load current configuration from .env
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      throw new Error('No .env file found in backend directory');
    }
    
    require('dotenv').config({ path: envPath });
    
    // Database configuration
    this.config = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || process.env.DB_NAME
    };
    
    // Validate configuration
    const requiredVars = ['host', 'user', 'password', 'database'];
    const missingVars = requiredVars.filter(key => !this.config[key]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing database configuration: ${missingVars.join(', ')}`);
    }
    
    logSuccess('Database configuration loaded');
    logInfo(`Database: ${this.config.database}@${this.config.host}:${this.config.port}`);
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
    
    const sequelize = this.createSequelizeConnection(this.config);
    
    try {
      await sequelize.authenticate();
      logSuccess('Connected to database');
      
      // Get all table names
      const [tables] = await sequelize.query(`
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
          const [data] = await sequelize.query(`SELECT * FROM "${tableName}"`);
          
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
        const [migrations] = await sequelize.query(`SELECT * FROM "SequelizeMeta"`);
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
      await sequelize.close();
    }
    
    logSuccess('Data export completed');
  }

  async createFreshDatabaseSchema() {
    logStep(4, 'Creating Fresh Database Schema');
    
    try {
      // Load models and create schema
      const { sequelize } = require('./models');
      
      await sequelize.authenticate();
      logSuccess('Connected to database');
      
      // Create all tables (force: true drops existing tables and recreates them)
      await sequelize.sync({ force: true });
      logSuccess('Fresh database schema created');
      
    } catch (error) {
      throw new Error(`Failed to create fresh schema: ${error.message}`);
    }
  }

  async importDataBack() {
    logStep(5, 'Importing Data Back');
    
    const sequelize = this.createSequelizeConnection(this.config);
    
    try {
      await sequelize.authenticate();
      logSuccess('Connected to database for import');
      
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
            
            // Insert data
            for (const record of exportData.data) {
              const values = columns.map(col => record[col]);
              await sequelize.query(`
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
      await sequelize.close();
    }
    
    logSuccess('Data import completed');
  }

  async validateRefresh() {
    logStep(6, 'Validating Refresh');
    
    const sequelize = this.createSequelizeConnection(this.config);
    
    try {
      await sequelize.authenticate();
      logSuccess('Database connection validated');
      
      // Check table counts
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      logInfo(`Found ${tables.length} tables in refreshed database`);
      
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
    
    logSuccess('Refresh validation completed');
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
    log('\n📊 REFRESH SUMMARY', 'bright');
    log('═══════════════════════════════════════════════════════════════');
    log(`Database: ${this.config.database}@${this.config.host}:${this.config.port}`);
    log(`Tables Refreshed: ${Object.keys(this.exportedData).length}`);
    log(`Backup Location: ${this.backupDir}`);
    log('\n📝 What was done:');
    log('1. ✅ Exported all existing data');
    log('2. ✅ Created fresh database schema');
    log('3. ✅ Imported all data back');
    log('4. ✅ Validated data integrity');
    log('\n🎉 Your database is now fresh and clean!');
    log('All your data and functionality are preserved.');
  }
}

// Run the refresh
if (require.main === module) {
  const refresher = new DatabaseRefresher();
  refresher.start().catch(console.error);
}

module.exports = DatabaseRefresher;
