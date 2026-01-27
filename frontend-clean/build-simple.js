const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a minimal build
console.log('🚀 Building Advancia PayLedger Frontend...');

// Create a simple index page if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a simple HTML file for deployment
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Advancia PayLedger - Global Financial Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      max-width: 600px;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    .btn {
      display: inline-block;
      padding: 1rem 2rem;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      transition: transform 0.3s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
    }
    .features {
      margin-top: 3rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .feature {
      background: rgba(255, 255, 255, 0.1);
      padding: 1rem;
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>💰 Advancia PayLedger</h1>
    <p>Global Financial Transformation Platform</p>
    <a href="/api/auth/login" class="btn">Access Dashboard</a>
    
    <div class="features">
      <div class="feature">
        <h3>🏥 Healthcare</h3>
        <p>Medical facility management</p>
      </div>
      <div class="feature">
        <h3>💎 Crypto</h3>
        <p>5+ blockchain support</p>
      </div>
      <div class="feature">
        <h3>🔐 Security</h3>
        <p>AI-powered protection</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(publicDir, 'index.html'), htmlContent);

// Create a simple API endpoint
const apiDir = path.join(__dirname, 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

const apiContent = `
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Advancia PayLedger API',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}
`;

fs.writeFileSync(path.join(apiDir, 'health.js'), apiContent);

console.log('✅ Build completed successfully!');
console.log('🌐 Ready for deployment to Vercel');
