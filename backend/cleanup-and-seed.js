const { sequelize } = require('./models');

const cleanupAndSeed = async () => {
  try {
    console.log('🧹 Cleaning up database constraints and seeding projects...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Drop foreign key constraints that are causing issues
    console.log('🔧 Removing problematic foreign key constraints...');
    
    try {
      await sequelize.query('ALTER TABLE course_tests DROP CONSTRAINT IF EXISTS course_tests_course_id_fkey;');
      await sequelize.query('ALTER TABLE course_tests DROP CONSTRAINT IF EXISTS course_tests_created_by_fkey;');
      console.log('✅ Removed problematic constraints');
    } catch (error) {
      console.log('⚠️  Some constraints may not exist (this is okay)');
    }
    
    // Now try to sync just the projects
    console.log('📋 Syncing projects table...');
    const { Project, ProjectPhase } = require('./models');
    
    // Create projects table if it doesn't exist
    await Project.sync({ force: false });
    await ProjectPhase.sync({ force: false });
    
    console.log('✅ Projects table synced successfully.');
    
    // Check if projects exist
    const existingProjects = await Project.findAll();
    
    if (existingProjects.length > 0) {
      console.log(`⚠️  Found ${existingProjects.length} existing projects. Skipping seeding.`);
    } else {
      console.log('🌱 No projects found. Running seeding...');
      const seedProjects = require('./seed-projects');
      await seedProjects();
      console.log('✅ Projects seeded successfully!');
      
      // Verify projects were created
      const projects = await Project.findAll();
      console.log(`✅ Created ${projects.length} projects:`);
      projects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.title}`);
      });
    }
    
    console.log('\n🎉 Setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
};

cleanupAndSeed();
