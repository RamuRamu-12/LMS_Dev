const { sequelize } = require('./models');

async function fixHackathonGroupMembers() {
  try {
    console.log('🔍 Checking hackathon_group_members table structure...');
    
    // Check if hackathon_group_members table exists
    const [tableExists] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'hackathon_group_members'
    `);
    
    if (tableExists.length === 0) {
      console.log('🔧 Creating hackathon_group_members table...');
      
      // Create the entire table with all required columns
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
      
      console.log('✅ Created hackathon_group_members table with all required columns');
      
    } else {
      // Table exists, check if joined_at column exists
      const [columnExists] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'hackathon_group_members' 
        AND column_name = 'joined_at'
      `);
      
      if (columnExists.length === 0) {
        console.log('🔧 Adding missing joined_at column to hackathon_group_members table...');
        
        await sequelize.query(`
          ALTER TABLE hackathon_group_members 
          ADD COLUMN joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
        
        console.log('✅ Added joined_at column to hackathon_group_members table');
      } else {
        console.log('✅ joined_at column already exists in hackathon_group_members table');
      }
    }
    
    console.log('🎉 Successfully fixed hackathon_group_members table schema!');
    
  } catch (error) {
    console.error('❌ Error fixing hackathon_group_members table:', error.message);
    throw error;
  }
}

// Run the fix
fixHackathonGroupMembers()
  .then(() => {
    console.log('✨ Hackathon group members table schema fixed successfully!');
    console.log('📝 You should now be able to update hackathon groups without errors.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to fix hackathon_group_members schema:', error.message);
    process.exit(1);
  });
