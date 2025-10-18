const { sequelize } = require('./models');
const seedProjects = require('./seed-projects');

const setupAndSeed = async () => {
  try {
    console.log('🔧 Setting up database and seeding projects...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database (create tables if they don't exist)
    console.log('📋 Syncing database tables...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced successfully.');
    
    // Check if projects already exist
    const { Project } = require('./models');
    const existingProjects = await Project.findAll();
    
    if (existingProjects.length > 0) {
      console.log(`⚠️  Found ${existingProjects.length} existing projects. Skipping seeding.`);
      console.log('Existing projects:');
      existingProjects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.title}`);
      });
    } else {
      console.log('🌱 No projects found. Running seeding...');
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
    console.log('📝 Next steps:');
    console.log('  1. Start backend server: npm start');
    console.log('  2. Test admin projects page');
    console.log('  3. Click "Seed Projects" button if needed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
};

setupAndSeed();
