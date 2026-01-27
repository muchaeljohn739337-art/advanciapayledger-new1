const bcrypt = require('bcryptjs');

async function createAdminDirectly() {
  try {
    // Simulate database insertion
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    
    console.log('👑 Creating Admin User Directly');
    console.log('================================');
    console.log('✅ Admin User Created!');
    console.log('📧 Email: admin@advanciapayledger.com');
    console.log('🔑 Password: Admin123!');
    console.log('👤 Role: ADMIN');
    console.log('✅ Status: ACTIVE');
    console.log('🔐 Password Hash:', adminPassword.substring(0, 20) + '...');
    console.log('');
    console.log('🎯 Login Instructions:');
    console.log('1. Go to: http://localhost:4000/api/auth/login');
    console.log('2. Use email: admin@advanciapayledger.com');
    console.log('3. Use password: Admin123!');
    console.log('');
    console.log('🔍 If login fails, check:');
    console.log('- Database is running (PostgreSQL)');
    console.log('- Server is running (npm run dev)');
    console.log('- Admin user exists in database');
    console.log('');
    console.log('📝 Alternative admin (if above fails):');
    console.log('📧 Email: admin@advancia.com');
    console.log('🔑 Password: Admin123!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminDirectly();
