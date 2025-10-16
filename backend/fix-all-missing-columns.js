const { sequelize } = require('./models');

async function fixAllMissingColumns() {
  try {
    console.log('🔍 COMPREHENSIVE DATABASE SCHEMA FIX');
    console.log('═══════════════════════════════════════════════════════════════');
    
    // Fix 1: Users table - bio, phone, location columns
    console.log('\n📋 Fixing Users table...');
    await fixUsersTable();
    
    // Fix 2: Course chapters table - test_id column
    console.log('\n📋 Fixing Course Chapters table...');
    await fixCourseChaptersTable();
    
    // Fix 3: Hackathon group members table - complete table structure
    console.log('\n📋 Fixing Hackathon Group Members table...');
    await fixHackathonGroupMembersTable();
    
    // Fix 4: Check and fix any other missing tables/columns
    console.log('\n📋 Checking other potential issues...');
    await checkOtherTables();
    
    console.log('\n🎉 ALL DATABASE SCHEMA ISSUES FIXED!');
    console.log('═══════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error.message);
    throw error;
  }
}

async function fixUsersTable() {
  try {
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('bio', 'phone', 'location')
    `);
    
    const existingColumns = columns.map(c => c.column_name);
    const missingColumns = [];
    
    if (!existingColumns.includes('bio')) missingColumns.push('bio');
    if (!existingColumns.includes('phone')) missingColumns.push('phone');
    if (!existingColumns.includes('location')) missingColumns.push('location');
    
    if (missingColumns.length === 0) {
      console.log('✅ Users table already has bio, phone, location columns');
      return;
    }
    
    console.log(`🔧 Adding missing columns to users: ${missingColumns.join(', ')}`);
    
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
      console.log(`✅ Added column: users.${column}`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing users table:', error.message);
  }
}

async function fixCourseChaptersTable() {
  try {
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'course_chapters' 
      AND column_name = 'test_id'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Course chapters table already has test_id column');
      return;
    }
    
    console.log('🔧 Adding test_id column to course_chapters...');
    
    await sequelize.query(`
      ALTER TABLE course_chapters 
      ADD COLUMN test_id INTEGER REFERENCES course_tests(id) ON DELETE SET NULL
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_course_chapters_test_id ON course_chapters(test_id)
    `);
    
    console.log('✅ Added test_id column to course_chapters');
    
  } catch (error) {
    console.error('❌ Error fixing course_chapters table:', error.message);
  }
}

async function fixHackathonGroupMembersTable() {
  try {
    // Check if table exists
    const [tableExists] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'hackathon_group_members'
    `);
    
    if (tableExists.length === 0) {
      console.log('🔧 Creating complete hackathon_group_members table...');
      
      await sequelize.query(`
        CREATE TABLE hackathon_group_members (
          id SERIAL PRIMARY KEY,
          group_id INTEGER NOT NULL REFERENCES hackathon_groups(id) ON UPDATE CASCADE ON DELETE CASCADE,
          student_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
          joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          is_leader BOOLEAN NOT NULL DEFAULT FALSE,
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'removed')),
          added_by INTEGER NOT NULL REFERENCES users(id),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(group_id, student_id)
        )
      `);
      
      // Create all indexes
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_hackathon_group_members_group_id ON hackathon_group_members(group_id)`);
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_hackathon_group_members_student_id ON hackathon_group_members(student_id)`);
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_hackathon_group_members_status ON hackathon_group_members(status)`);
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_hackathon_group_members_is_leader ON hackathon_group_members(is_leader)`);
      
      console.log('✅ Created complete hackathon_group_members table');
      
    } else {
      // Table exists, check for missing columns
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'hackathon_group_members'
      `);
      
      const existingColumns = columns.map(c => c.column_name);
      const requiredColumns = ['joined_at', 'is_leader', 'status', 'added_by'];
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('✅ hackathon_group_members table already has all required columns');
        return;
      }
      
      console.log(`🔧 Adding missing columns to hackathon_group_members: ${missingColumns.join(', ')}`);
      
      for (const column of missingColumns) {
        let columnDef;
        switch (column) {
          case 'joined_at':
            columnDef = 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP';
            break;
          case 'is_leader':
            columnDef = 'BOOLEAN NOT NULL DEFAULT FALSE';
            break;
          case 'status':
            columnDef = 'VARCHAR(20) NOT NULL DEFAULT \'active\'';
            break;
          case 'added_by':
            columnDef = 'INTEGER NOT NULL REFERENCES users(id)';
            break;
        }
        
        await sequelize.query(`ALTER TABLE hackathon_group_members ADD COLUMN ${column} ${columnDef}`);
        console.log(`✅ Added column: hackathon_group_members.${column}`);
      }
      
      // Create missing indexes
      if (!existingColumns.includes('is_leader')) {
        await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_hackathon_group_members_is_leader ON hackathon_group_members(is_leader)`);
      }
      if (!existingColumns.includes('status')) {
        await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_hackathon_group_members_status ON hackathon_group_members(status)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing hackathon_group_members table:', error.message);
  }
}

async function checkOtherTables() {
  try {
    // Check if hackathon_groups table exists
    const [groupsTableExists] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'hackathon_groups'
    `);
    
    if (groupsTableExists.length === 0) {
      console.log('🔧 Creating hackathon_groups table...');
      
      await sequelize.query(`
        CREATE TABLE hackathon_groups (
          id SERIAL PRIMARY KEY,
          hackathon_id INTEGER NOT NULL REFERENCES hackathons(id) ON UPDATE CASCADE ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          max_members INTEGER,
          current_members INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_by INTEGER NOT NULL REFERENCES users(id),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(hackathon_id, name)
        )
      `);
      
      // Create indexes for hackathon_groups
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_hackathon_groups_hackathon_id ON hackathon_groups(hackathon_id)`);
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_hackathon_groups_name ON hackathon_groups(name)`);
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_hackathon_groups_is_active ON hackathon_groups(is_active)`);
      await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_hackathon_groups_created_by ON hackathon_groups(created_by)`);
      
      console.log('✅ Created hackathon_groups table');
    } else {
      console.log('✅ hackathon_groups table already exists');
    }
    
    // Check if max_groups column exists in hackathons table
    const [maxGroupsColumn] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'hackathons' 
      AND column_name = 'max_groups'
    `);
    
    if (maxGroupsColumn.length === 0) {
      console.log('🔧 Adding max_groups column to hackathons table...');
      
      await sequelize.query(`
        ALTER TABLE hackathons 
        ADD COLUMN max_groups INTEGER
      `);
      
      console.log('✅ Added max_groups column to hackathons table');
    } else {
      console.log('✅ hackathons table already has max_groups column');
    }
    
  } catch (error) {
    console.error('❌ Error checking other tables:', error.message);
  }
}

// Run the comprehensive fix
fixAllMissingColumns()
  .then(() => {
    console.log('\n✨ ALL DATABASE SCHEMA ISSUES RESOLVED!');
    console.log('📝 You should now be able to:');
    console.log('   • Login without bio column errors');
    console.log('   • Create course chapters without test_id errors');
    console.log('   • Update hackathon groups without joined_at/is_leader errors');
    console.log('\n🎉 Your LMS should work perfectly now!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to fix database schema:', error.message);
    process.exit(1);
  });
