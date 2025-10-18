const axios = require('axios');

const testProjectsAPI = async () => {
  try {
    console.log('🧪 Testing projects API...');
    
    const response = await axios.get('http://localhost:5000/api/projects');
    console.log('✅ API Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.projects.length > 0) {
      console.log(`🎉 Found ${response.data.data.projects.length} projects!`);
      response.data.data.projects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.title}`);
      });
    } else {
      console.log('❌ No projects found in API response');
      console.log('💡 Try clicking the "Seed Projects" button in the admin interface');
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server is not running. Start it with: npm start');
    }
  }
};

testProjectsAPI();
