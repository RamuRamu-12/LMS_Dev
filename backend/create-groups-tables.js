const { sequelize } = require('./models');

async function createGroupsTables() {
  try {
    console.log('Creating groups tables...');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Create groups table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        max_members INTEGER,
        current_members INTEGER NOT NULL DEFAULT 0,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Groups table created successfully!');
    
    // Create group_members table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS group_members (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_leader BOOLEAN NOT NULL DEFAULT FALSE,
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
        added_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE (group_id, student_id)
      );
    `);
    console.log('Group members table created successfully!');
    
    // Check if hackathon_groups table exists before adding column
    const tableExists = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hackathon_groups'
      );
    `);
    
    if (tableExists[0][0].exists) {
      // Add group_id column to hackathon_groups table
      await sequelize.query(`
        ALTER TABLE hackathon_groups 
        ADD COLUMN IF NOT EXISTS group_id INTEGER,
        ADD CONSTRAINT fk_hackathon_groups_group_id 
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;
      `);
      console.log('Added group_id column to hackathon_groups table!');
    } else {
      console.log('hackathon_groups table does not exist yet, skipping column addition');
    }
    
    console.log('All tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createGroupsTables();
