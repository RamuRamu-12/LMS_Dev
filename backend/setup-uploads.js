const fs = require('fs');
const path = require('path');

// Create uploads directory structure
const uploadsDir = path.join(__dirname, 'uploads');
const logosDir = path.join(uploadsDir, 'logos');

// Create directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
  console.log('✅ Created uploads/logos directory');
}

console.log('📁 Upload directories are ready!');
console.log('📂 Uploads directory:', uploadsDir);
console.log('📂 Logos directory:', logosDir);
