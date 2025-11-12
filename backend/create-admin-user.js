require('dotenv').config();

// Force development mode to disable SSL for local database
// This must be set BEFORE requiring models to ensure correct database config
if (!process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST.includes('localhost')) {
  process.env.NODE_ENV = 'development';
}

const { User } = require('./models');
const readline = require('readline');

/**
 * CREATE ADMIN USER SCRIPT
 * 
 * Creates an admin user account for the LMS
 * Interactive script that asks for admin details
 * 
 * Usage: node create-admin-user.js
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function createAdminUser() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   👑 CREATE ADMIN USER');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');

  try {
    // Get admin details from user
    console.log('Please enter admin user details:\n');
    
    const name = await question('Admin Name: ');
    if (!name || name.trim().length < 2) {
      console.log('\n❌ Name must be at least 2 characters long\n');
      rl.close();
      process.exit(1);
    }

    const email = await question('Admin Email: ');
    if (!email || !email.includes('@')) {
      console.log('\n❌ Please enter a valid email address\n');
      rl.close();
      process.exit(1);
    }

    const password = await question('Admin Password (min 6 characters): ');
    if (!password || password.length < 6) {
      console.log('\n❌ Password must be at least 6 characters long\n');
      rl.close();
      process.exit(1);
    }

    console.log('\n');
    console.log('📡 Connecting to database...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { email: email } 
    });

    if (existingAdmin) {
      console.log(`\n⚠️  User with email ${email} already exists!`);
      
      const updateChoice = await question('\nDo you want to update this user to admin? (yes/no): ');
      
      if (updateChoice.toLowerCase() === 'yes' || updateChoice.toLowerCase() === 'y') {
        await existingAdmin.update({
          name: name,
          role: 'admin',
          password: password,
          is_active: true
        });
        
        console.log('\n');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('   ✅ ADMIN USER UPDATED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('\n');
        console.log('👤 Admin Details:\n');
        console.log(`   Name: ${existingAdmin.name}`);
        console.log(`   Email: ${existingAdmin.email}`);
        console.log(`   Role: ${existingAdmin.role}`);
        console.log(`   ID: ${existingAdmin.id}\n`);
        console.log('🔑 You can now login with these credentials!\n');
      } else {
        console.log('\n❌ Operation cancelled.\n');
      }
      
      rl.close();
      process.exit(0);
    }

    // Create new admin user
    console.log('📝 Creating admin user...\n');
    
    const admin = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: 'admin',
      is_active: true,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ✅ ADMIN USER CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    console.log('👤 Admin Details:\n');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}\n`);
    console.log('🔑 Login Credentials:\n');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: (the one you just entered)\n`);
    console.log('📝 Next Steps:\n');
    console.log('   1. Start backend: npm start');
    console.log('   2. Open browser: http://localhost:5000');
    console.log('   3. Login with the credentials above');
    console.log('   4. Start creating courses! 🎉\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ❌ ADMIN USER CREATION FAILED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    console.error('Error:', error.message);
    console.log('\n');
    console.log('💡 Common Issues:\n');
    console.log('   1. Database not connected - run: node create-all-tables.js');
    console.log('   2. Users table does not exist - create tables first');
    console.log('   3. Email validation failed - check email format');
    console.log('   4. Password too short - minimum 6 characters\n');

    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdminUser();
