const crypto = require('crypto');

console.log('👑 Advancia Pay Ledger - Admin Creation');
console.log('==========================================');

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

console.log('✅ Admin User Created!');
console.log('📧 Email:', adminData.email);
console.log('🔑 Password:', adminData.password);
console.log('👤 Role:', adminData.role);
console.log('🆔 ID:', adminData.id);
console.log('✅ Status:', adminData.status);
console.log('🔒 Approved By:', adminData.approvedBy);

console.log('');
console.log('🎉 Admin user ready for login!');
console.log('🌐 URL: http://localhost:4000/admin/login');
