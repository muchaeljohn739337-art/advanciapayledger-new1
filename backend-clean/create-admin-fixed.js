const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔒 Advancia Pay Ledger - Creating Creator\'s Admin User...');
    
    // Check if admin exists using correct table name
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@advancia.com' }
    });

    if (existing) {
      console.log('✅ Admin user already exists:', { 
        id: existing.id, 
        email: existing.email, 
        role: existing.role,
        status: existing.status || 'ACTIVE'
      });
      await prisma.$disconnect();
      return;
    }

    // Create admin user with creator's sovereign credentials
    const passwordHash = await bcrypt.hash('Admin123!', 12);
    const admin = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: 'admin@advancia.com',
        firstName: 'Creator',
        lastName: 'Admin',
        password: passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        approvedBy: 'CREATOR',
        approvedAt: new Date(),
        registeredAt: new Date(),
        autoApproved: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('👑 Creator\'s Admin User Created Successfully!');
    console.log('🔐 Credentials:');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: Admin123!');
    console.log('👤 Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    console.log('✅ Status:', admin.status);
    console.log('🔒 Approved By:', admin.approvedBy);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    console.error('🔍 Details:', error);
    await prisma.$disconnect();
  }
}

createAdminUser();
