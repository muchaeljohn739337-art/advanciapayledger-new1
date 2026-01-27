const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testing Admin Login...');
    console.log('========================');
    
    // Test login with admin credentials
    const loginData = {
      email: 'admin@advanciapayledger.com',
      password: 'Admin123!'
    };
    
    console.log('📧 Trying email:', loginData.email);
    console.log('🔑 Password:', loginData.password);
    console.log('');
    
    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', loginData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      console.log('✅ Login Successful!');
      console.log('🎉 Response:', response.data);
      console.log('🔑 Token:', response.data.token ? 'Generated' : 'Missing');
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running on port 4000');
        console.log('🚀 Please start the server with: npm run dev');
      } else if (error.response) {
        console.log('❌ Login Failed!');
        console.log('📊 Status:', error.response.status);
        console.log('📝 Error:', error.response.data);
        console.log('');
        console.log('🔍 Possible Issues:');
        console.log('1. Admin user not in database');
        console.log('2. Database not running');
        console.log('3. Wrong email/password');
        console.log('4. Admin status not ACTIVE');
      } else {
        console.log('❌ Network Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testLogin();
