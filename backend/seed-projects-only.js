const { sequelize } = require('./models');
const seedProjects = require('./seed-projects');

const seedProjectsOnly = async () => {
  try {
    console.log('🌱 Seeding projects only (no schema changes)...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Check if projects already exist
    const { Project } = require('./models');
    const existingProjects = await Project.findAll();
    
    if (existingProjects.length > 0) {
      console.log(`⚠️  Found ${existingProjects.length} existing projects:`);
      existingProjects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.title}`);
      });
      console.log('\n✅ Projects already exist! No seeding needed.');
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
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log('📝 Next steps:');
    console.log('  1. Start backend server: npm start');
    console.log('  2. Test admin projects page');
    console.log('  3. Projects should now be visible');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    
    if (error.message.includes('relation "projects" does not exist')) {
      console.log('\n💡 The projects table does not exist.');
      console.log('   You need to create the database tables first.');
      console.log('   Try: node create-all-tables.js');
    } else {
      console.log('\n💡 Troubleshooting:');
      console.log('  1. Check if database is running');
      console.log('  2. Verify .env file has correct database credentials');
      console.log('  3. Try: node run-project-seeding.js');
    }
    
    process.exit(1);
  }
};

seedProjectsOnly();
