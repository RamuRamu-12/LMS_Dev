const { sequelize } = require('./models');
const seedProjects = require('./seed-projects');

const setupAndSeed = async () => {
  try {
    console.log('🔧 Setting up database and seeding projects...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Check if projects table exists and has data
    const { Project } = require('./models');
    
    try {
      const existingProjects = await Project.findAll();
      
      if (existingProjects.length > 0) {
        console.log(`⚠️  Found ${existingProjects.length} existing projects. Skipping seeding.`);
        console.log('Existing projects:');
        existingProjects.forEach((project, index) => {
          console.log(`  ${index + 1}. ${project.title}`);
        });
        console.log('\n🎉 Projects already exist! Setup completed.');
        process.exit(0);
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
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('relation "projects" does not exist')) {
        console.log('📋 Projects table does not exist. Creating tables...');
        
        // Create only the projects-related tables
        await sequelize.sync({ force: false });
        console.log('✅ Database tables created successfully.');
        
        // Now seed projects
        console.log('🌱 Seeding projects...');
        await seedProjects();
        console.log('✅ Projects seeded successfully!');
        
        // Verify projects were created
        const projects = await Project.findAll();
        console.log(`✅ Created ${projects.length} projects:`);
        projects.forEach((project, index) => {
          console.log(`  ${index + 1}. ${project.title}`);
        });
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('📝 Next steps:');
    console.log('  1. Start backend server: npm start');
    console.log('  2. Test admin projects page');
    console.log('  3. Click "Seed Projects" button if needed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Alternative solution:');
    console.log('  1. Try: node run-project-seeding.js');
    console.log('  2. Or use the "Seed Projects" button in the admin interface');
    process.exit(1);
  }
};

setupAndSeed();
