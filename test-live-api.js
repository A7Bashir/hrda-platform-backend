const https = require('https');

// Replace this with your actual Render URL
const BASE_URL = 'https://hrda-platform-api.onrender.com'; // UPDATE THIS!

console.log('🧪 Testing Live HRDA Platform API on Render');
console.log('📍 URL:', BASE_URL);
console.log('');

// Test health endpoint
function testHealth() {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/health`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Health Check:', res.statusCode);
        if (res.statusCode === 200) {
          console.log('   Response:', JSON.parse(data));
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log('❌ Health Check Failed:', err.message);
      resolve();
    });
  });
}

// Test API info endpoint
function testAPIInfo() {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/api`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ API Info:', res.statusCode);
        if (res.statusCode === 200) {
          console.log('   Response:', JSON.parse(data));
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log('❌ API Info Failed:', err.message);
      resolve();
    });
  });
}

// Test robots endpoint
function testRobots() {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/api/robots`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Robots API:', res.statusCode);
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('   Found', response.count, 'robots');
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log('❌ Robots API Failed:', err.message);
      resolve();
    });
  });
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testHealth();
  await testAPIInfo();
  await testRobots();
  
  console.log('\n🎉 Testing Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Build frontend dashboard');
  console.log('2. Test file upload functionality');
  console.log('3. Connect to your robots');
}

// Check if URL is updated
if (BASE_URL.includes('your-app-name')) {
  console.log('⚠️  IMPORTANT: Update the BASE_URL in this file first!');
  console.log('   Replace "your-app-name" with your actual Render app name');
  console.log('   Example: https://hrda-platform-api-abc123.onrender.com');
} else {
  runTests();
}
