import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Advancia PayLedger API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Basic auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple admin check (in production, use proper authentication)
  if (email === 'admin@advancia.com' && password === 'Admin123!') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 1,
        email: 'admin@advancia.com',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// User info endpoint
app.get('/api/users/me', (req, res) => {
  res.json({
    id: 1,
    email: 'admin@advancia.com',
    role: 'admin',
    facilities: 24,
    mrr: 247000
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Advancia PayLedger API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
});

export default app;
