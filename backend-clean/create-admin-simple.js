// ============================================================================
// ADVANCIA PAY LEDGER - CREATOR'S SIMPLE ADMIN CREATION
// Author: Original Creator - Direct Database Access
// Purpose: Create admin without Prisma dependencies
// ============================================================================

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function createSimpleAdmin() {
  try {
    console.log('🔒 Advancia Pay Ledger - Creating Creator\'s Admin User (Direct)...');
    
    // Simple admin creation without database
    const adminData = {
      id: crypto.randomUUID(),
      email: 'admin@advancia.com',
      firstName: 'Creator',
      lastName: 'Admin',
      password: 'Admin123!',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      approvedBy: 'CREATOR',
      approvedAt: new Date(),
      registeredAt: new Date(),
      autoApproved: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 12);
    adminData.passwordHash = passwordHash;
    
    console.log('👑 Creator\'s Admin User Data Prepared!');
    console.log('🔐 Credentials:');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Role:', adminData.role);
    console.log('🆔 ID:', adminData.id);
    console.log('✅ Status:', adminData.status);
    console.log('🔒 Approved By:', adminData.approvedBy);
    console.log('🔐 Password Hash:', passwordHash.substring(0, 20) + '...');
    
    // Save to file for manual database insertion
    const fs = require('fs');
    const adminDataStr = JSON.stringify(adminData, null, 2);
    fs.writeFileSync('creator-admin-data.json', adminDataStr);
    
    console.log('💾 Admin data saved to: creator-admin-data.json');
    console.log('🔒 Ready for manual database insertion');
    
    return adminData;
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    console.error('🔍 Details:', error);
  }
}

createSimpleAdmin();
