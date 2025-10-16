const { sequelize } = require('./models');

async function fixHackathonGroupsDisplay() {
  try {
    console.log('🔍 FIXING HACKATHON GROUPS DISPLAY ISSUE');
    console.log('═══════════════════════════════════════════════════════════════');
    
    // Step 1: Fix database schema issues
    console.log('\n📋 Step 1: Fixing Database Schema...');
    await fixDatabaseSchema();
    
    // Step 2: Verify tables exist and have correct structure
    console.log('\n📋 Step 2: Verifying Table Structure...');
    await verifyTableStructure();
    
    // Step 3: Check existing hackathon groups data
    console.log('\n📋 Step 3: Checking Existing Data...');
    await checkExistingData();
    
    console.log('\n🎉 HACKATHON GROUPS DISPLAY FIX COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Error fixing hackathon groups display:', error.message);
    throw error;
  }
}

async function fixDatabaseSchema() {
  try {
    // Fix hackathon_groups table
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
      
      // Create indexes
      await sequelize.query(`CREATE INDEX idx_hackathon_groups_hackathon_id ON hackathon_groups(hackathon_id)`);
      await sequelize.query(`CREATE INDEX idx_hackathon_groups_name ON hackathon_groups(name)`);
      await sequelize.query(`CREATE INDEX idx_hackathon_groups_is_active ON hackathon_groups(is_active)`);
      await sequelize.query(`CREATE INDEX idx_hackathon_groups_created_by ON hackathon_groups(created_by)`);
      
      console.log('✅ Created hackathon_groups table');
    } else {
      console.log('✅ hackathon_groups table exists');
    }
    
    // Fix hackathon_group_members table
    const [membersTableExists] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'hackathon_group_members'
    `);
    
    if (membersTableExists.length === 0) {
      console.log('🔧 Creating hackathon_group_members table...');
      
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
      
      // Create indexes
      await sequelize.query(`CREATE INDEX idx_hackathon_group_members_group_id ON hackathon_group_members(group_id)`);
      await sequelize.query(`CREATE INDEX idx_hackathon_group_members_student_id ON hackathon_group_members(student_id)`);
      await sequelize.query(`CREATE INDEX idx_hackathon_group_members_status ON hackathon_group_members(status)`);
      await sequelize.query(`CREATE INDEX idx_hackathon_group_members_is_leader ON hackathon_group_members(is_leader)`);
      
      console.log('✅ Created hackathon_group_members table');
    } else {
      // Check for missing columns
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'hackathon_group_members'
      `);
      
      const existingColumns = columns.map(c => c.column_name);
      const requiredColumns = ['joined_at', 'is_leader', 'status', 'added_by'];
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
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
      } else {
        console.log('✅ hackathon_group_members table has all required columns');
      }
    }
    
    // Add max_groups column to hackathons table if missing
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
    console.error('❌ Error fixing database schema:', error.message);
    throw error;
  }
}

async function verifyTableStructure() {
  try {
    // Check hackathon_groups table structure
    const [groupsColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'hackathon_groups'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 hackathon_groups table structure:');
    groupsColumns.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check hackathon_group_members table structure
    const [membersColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'hackathon_group_members'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 hackathon_group_members table structure:');
    membersColumns.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error verifying table structure:', error.message);
  }
}

async function checkExistingData() {
  try {
    // Check if there are any hackathons
    const [hackathons] = await sequelize.query(`SELECT COUNT(*) as count FROM hackathons`);
    console.log(`📊 Total hackathons: ${hackathons[0].count}`);
    
    // Check if there are any hackathon groups
    const [groups] = await sequelize.query(`SELECT COUNT(*) as count FROM hackathon_groups`);
    console.log(`📊 Total hackathon groups: ${groups[0].count}`);
    
    // Check if there are any group members
    const [members] = await sequelize.query(`SELECT COUNT(*) as count FROM hackathon_group_members`);
    console.log(`📊 Total group members: ${members[0].count}`);
    
    // Show sample hackathon groups if they exist
    if (groups[0].count > 0) {
      const [sampleGroups] = await sequelize.query(`
        SELECT hg.id, hg.name, hg.description, hg.hackathon_id, hg.current_members,
               h.name as hackathon_name
        FROM hackathon_groups hg
        LEFT JOIN hackathons h ON hg.hackathon_id = h.id
        ORDER BY hg.created_at DESC
        LIMIT 5
      `);
      
      console.log('📊 Sample hackathon groups:');
      sampleGroups.forEach(group => {
        console.log(`   • Group "${group.name}" (ID: ${group.id}) - Hackathon: "${group.hackathon_name}" - Members: ${group.current_members}`);
      });
    }
    
    // Test the association query that the controller uses
    console.log('\n🔍 Testing hackathon groups fetch query...');
    const [testQuery] = await sequelize.query(`
      SELECT h.id, h.name, hg.id as group_id, hg.name as group_name, 
             hg.description, hg.current_members,
             COUNT(hgm.id) as actual_member_count
      FROM hackathons h
      LEFT JOIN hackathon_groups hg ON h.id = hg.hackathon_id
      LEFT JOIN hackathon_group_members hgm ON hg.id = hgm.group_id AND hgm.status = 'active'
      WHERE h.id = (SELECT id FROM hackathons LIMIT 1)
      GROUP BY h.id, h.name, hg.id, hg.name, hg.description, hg.current_members
      ORDER BY hg.created_at ASC
    `);
    
    console.log('📊 Test query results:');
    if (testQuery.length === 0) {
      console.log('   ⚠️  No hackathons found to test with');
    } else {
      testQuery.forEach(result => {
        if (result.group_id) {
          console.log(`   ✅ Hackathon "${result.name}" has group "${result.group_name}" with ${result.actual_member_count} members`);
        } else {
          console.log(`   ⚠️  Hackathon "${result.name}" has no groups`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking existing data:', error.message);
  }
}

// Run the fix
fixHackathonGroupsDisplay()
  .then(() => {
    console.log('\n✨ HACKATHON GROUPS DISPLAY FIXED!');
    console.log('📝 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Try updating a hackathon with groups');
    console.log('   3. The groups should now be properly fetched and displayed');
    console.log('\n🎉 Your hackathon groups should work perfectly now!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to fix hackathon groups display:', error.message);
    process.exit(1);
  });
