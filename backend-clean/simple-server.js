const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Advancia PayLedger API is running' });
});

// Simple auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock admin user
    if (email === 'admin@advancia.com' && password === 'Admin123!') {
      res.json({
        token: 'mock-jwt-token',
        user: {
          id: 'admin-1',
          email: 'admin@advancia.com',
          firstName: 'Creator',
          lastName: 'Admin',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      return;
    }
    
    if (email === 'admin@advanciapayledger.com' && password === 'Admin123!') {
      res.json({
        token: 'mock-jwt-token',
        user: {
          id: 'admin-2',
          email: 'admin@advanciapayledger.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      return;
    }
    
    res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Advancia PayLedger API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log('');
  console.log('👑 Admin Credentials:');
  console.log('📧 Email: admin@advancia.com');
  console.log('🔑 Password: Admin123!');
  console.log('');
  console.log('📧 Alternative Email: admin@advanciapayledger.com');
  console.log('🔑 Password: Admin123!');
  console.log('');
  console.log('🎉 SYSTEM IS LIVE! 🎉');
});
