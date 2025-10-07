const { sequelize } = require('./models');

async function fixMigrationIssue() {
  try {
    console.log('🔧 Fixing migration constraint issue...');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Check if hackathon_groups table exists
    const [hackathonGroupsExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathon_groups'
      );
    `);
    
    if (!hackathonGroupsExists[0].exists) {
      console.log('❌ hackathon_groups table does not exist. Creating it...');
      
      // Create hackathon_groups table
      await sequelize.query(`
        CREATE TABLE hackathon_groups (
          id SERIAL PRIMARY KEY,
          hackathon_id INTEGER NOT NULL,
          group_id INTEGER,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          max_members INTEGER,
          current_members INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_by INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE,
          FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE (hackathon_id, name)
        );
      `);
      console.log('✅ hackathon_groups table created successfully!');
    } else {
      console.log('✅ hackathon_groups table already exists.');
      
      // Check if group_id column exists
      const [columnExists] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'hackathon_groups'
          AND column_name = 'group_id'
        );
      `);
      
      if (!columnExists[0].exists) {
        console.log('❌ group_id column missing. Adding it...');
        await sequelize.query(`
          ALTER TABLE hackathon_groups 
          ADD COLUMN group_id INTEGER,
          ADD CONSTRAINT fk_hackathon_groups_group_id 
          FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;
        `);
        console.log('✅ group_id column added successfully!');
      } else {
        console.log('✅ group_id column already exists.');
      }
    }
    
    // Check if hackathon_group_members table exists
    const [hackathonGroupMembersExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathon_group_members'
      );
    `);
    
    if (!hackathonGroupMembersExists[0].exists) {
      console.log('❌ hackathon_group_members table does not exist. Creating it...');
      
      // Create hackathon_group_members table
      await sequelize.query(`
        CREATE TABLE hackathon_group_members (
          id SERIAL PRIMARY KEY,
          group_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          is_leader BOOLEAN NOT NULL DEFAULT FALSE,
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
          added_by INTEGER,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (group_id) REFERENCES hackathon_groups(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
          UNIQUE (group_id, student_id)
        );
      `);
      console.log('✅ hackathon_group_members table created successfully!');
    } else {
      console.log('✅ hackathon_group_members table already exists.');
    }
    
    console.log('\n🎉 All hackathon group tables are ready!');
    console.log('✅ The frontend should now work without errors.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing migration issue:', error);
    process.exit(1);
  }
}

fixMigrationIssue();
