const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'advancia-payledger-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// Mock database
const users = [
  {
    id: 'admin-1',
    email: 'admin@advancia.com',
    password: '$2a$10$mock.hash.for.Admin123!', // bcrypt hash of Admin123!
    firstName: 'Michael',
    lastName: 'Creator',
    role: 'ADMIN',
    status: 'ACTIVE',
    facilities: 24,
    mrr: 247000
  }
];

const transactions = [
  { id: 'txn-001', facility: 'General Hospital', amount: 12500, type: 'PAYMENT', status: 'COMPLETED', timestamp: new Date().toISOString() },
  { id: 'txn-002', facility: 'Medical Center', amount: 8500, type: 'TRANSFER', status: 'PENDING', timestamp: new Date().toISOString() },
  { id: 'txn-003', facility: 'Health Clinic', amount: 15200, type: 'PAYMENT', status: 'COMPLETED', timestamp: new Date().toISOString() },
  { id: 'txn-004', facility: 'Surgical Center', amount: 22000, type: 'WITHDRAWAL', status: 'PROCESSING', timestamp: new Date().toISOString() }
];

const facilities = [
  { id: 'fac-001', name: 'General Hospital', state: 'California', beds: 250, mrr: 15000, status: 'ACTIVE' },
  { id: 'fac-002', name: 'Medical Center', state: 'Texas', beds: 180, mrr: 12000, status: 'ACTIVE' },
  { id: 'fac-003', name: 'Health Clinic', state: 'Florida', beds: 75, mrr: 8000, status: 'ACTIVE' },
  { id: 'fac-004', name: 'Surgical Center', state: 'New York', beds: 120, mrr: 10000, status: 'ACTIVE' }
];

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Advancia PayLedger API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime()
  });
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // For demo, accept admin credentials
    if (email === 'admin@advancia.com' && password === 'Admin123!') {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status
        }
      });
      return;
    }
    
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dashboard metrics
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const metrics = {
    mrr: 247000,
    growth: 42,
    facilities: 24,
    transactions: 2800000,
    states: 8,
    activeUsers: 1247,
    pendingTransactions: 12,
    completedTransactions: 2847,
    failedTransactions: 3,
    avgTransactionValue: 8500,
    monthlyGrowth: 42,
    yearlyGrowth: 380
  };
  
  res.json({ success: true, data: metrics });
});

// Transactions
app.get('/api/transactions', authenticateToken, (req, res) => {
  const { page = 1, limit = 10, status, type } = req.query;
  
  let filteredTransactions = [...transactions];
  
  if (status) {
    filteredTransactions = filteredTransactions.filter(t => t.status === status);
  }
  
  if (type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      transactions: paginatedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredTransactions.length,
        pages: Math.ceil(filteredTransactions.length / limit)
      }
    }
  });
});

// Facilities
app.get('/api/facilities', authenticateToken, (req, res) => {
  const { page = 1, limit = 10, state, status } = req.query;
  
  let filteredFacilities = [...facilities];
  
  if (state) {
    filteredFacilities = filteredFacilities.filter(f => f.state === state);
  }
  
  if (status) {
    filteredFacilities = filteredFacilities.filter(f => f.status === status);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedFacilities = filteredFacilities.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      facilities: paginatedFacilities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredFacilities.length,
        pages: Math.ceil(filteredFacilities.length / limit)
      }
    }
  });
});

// Create transaction
app.post('/api/transactions', authenticateToken, (req, res) => {
  try {
    const { facility, amount, type, description } = req.body;
    
    const newTransaction = {
      id: `txn-${Date.now()}`,
      facility,
      amount: parseFloat(amount),
      type: type.toUpperCase(),
      status: 'PENDING',
      description,
      timestamp: new Date().toISOString(),
      createdBy: req.user.id
    };
    
    transactions.unshift(newTransaction);
    
    res.json({
      success: true,
      data: newTransaction,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create transaction' });
  }
});

// Update transaction status
app.patch('/api/transactions/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    transaction.status = status.toUpperCase();
    transaction.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: transaction,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update transaction' });
  }
});

// User profile
app.get('/api/users/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      facilities: user.facilities,
      mrr: user.mrr
    }
  });
});

// Analytics data
app.get('/api/analytics/revenue', authenticateToken, (req, res) => {
  const revenueData = [
    { month: 'Jan', revenue: 185000, transactions: 234 },
    { month: 'Feb', revenue: 198000, transactions: 267 },
    { month: 'Mar', revenue: 215000, transactions: 298 },
    { month: 'Apr', revenue: 238000, transactions: 324 },
    { month: 'May', revenue: 247000, transactions: 347 },
    { month: 'Jun', revenue: 265000, transactions: 378 }
  ];
  
  res.json({ success: true, data: revenueData });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Advancia PayLedger API v2.0 running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`💼 Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`💰 Transactions: http://localhost:${PORT}/api/transactions`);
  console.log(`🏥 Facilities: http://localhost:${PORT}/api/facilities`);
});

module.exports = app;
