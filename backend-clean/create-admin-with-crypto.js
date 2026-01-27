const crypto = require('crypto');

console.log('👑 Advancia Pay Ledger - Admin Creation with Crypto Addresses');
console.log('=============================================================');

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
  updatedAt: new Date(),
  
  // Cryptocurrency Addresses
  ethereumAddress: '0x6beb245C6DCc2CE1f6635716f1253d2D3be500BD',
  bitcoinAddress: 'bc1q37a9kpzyea5cahpyx8xpx6v7vr5na64f4cxxnt',
  
  // Additional blockchain addresses
  polygonAddress: '0x6beb245C6DCc2CE1f6635716f1253d2D3be500BD',
  bscAddress: '0x6beb245C6DCc2CE1f6635716f1253d2D3be500BD',
  arbitrumAddress: '0x6beb245C6DCc2CE1f6635716f1253d2D3be500BD',
  optimismAddress: '0x6beb245C6DCc2CE1f6635716f1253d2D3be500BD',
  stellarAddress: 'G6beb245C6DCc2CE1f6635716f1253d2D3be500BD',
  
  // Wallet balance
  balance: 1000000,
  usdValue: 1000000
};

console.log('✅ Admin User Created with Crypto Addresses!');
console.log('📧 Email:', adminData.email);
console.log('🔑 Password:', adminData.password);
console.log('👤 Role:', adminData.role);
console.log('🆔 ID:', adminData.id);
console.log('✅ Status:', adminData.status);
console.log('🔒 Approved By:', adminData.approvedBy);
console.log('');
console.log('💰 Cryptocurrency Addresses:');
console.log('🔗 Ethereum:', adminData.ethereumAddress);
console.log('₿ Bitcoin:', adminData.bitcoinAddress);
console.log('🟣 Polygon:', adminData.polygonAddress);
console.log('🟡 BSC:', adminData.bscAddress);
console.log('🔵 Arbitrum:', adminData.arbitrumAddress);
console.log('🔴 Optimism:', adminData.optimismAddress);
console.log('⭐ Stellar:', adminData.stellarAddress);
console.log('');
console.log('💎 Wallet Balance: $', adminData.balance.toLocaleString());
console.log('');
console.log('🎉 Admin user ready for login!');
console.log('🌐 URL: http://localhost:4000/admin/login');
console.log('');
console.log('📋 Save this information for login!');
