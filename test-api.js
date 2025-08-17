const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/health',
    expectedStatus: 200
  },
  {
    name: 'API Info',
    method: 'GET',
    path: '/api',
    expectedStatus: 200
  },
  {
    name: 'Get All Robots',
    method: 'GET',
    path: '/api/robots',
    expectedStatus: 200
  },
  {
    name: 'Get Robot by ID',
    method: 'GET',
    path: '/api/robots/ROBOT_001',
    expectedStatus: 200
  },
  {
    name: 'Get All Content',
    method: 'GET',
    path: '/api/content',
    expectedStatus: 200
  },
  {
    name: 'Get Content by ID',
    method: 'GET',
    path: '/api/content/content_001',
    expectedStatus: 200
  },
  {
    name: 'Get Update History',
    method: 'GET',
    path: '/api/updates/history',
    expectedStatus: 200
  }
];

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: response
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  
  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`  ${test.method} ${test.path}`);
      
      const response = await makeRequest(test.method, test.path);
      
      if (response.status === test.expectedStatus) {
        console.log(`  ✅ PASSED (Status: ${response.status})`);
        passedTests++;
      } else {
        console.log(`  ❌ FAILED (Expected: ${test.expectedStatus}, Got: ${response.status})`);
      }
      
      // Show response summary
      if (response.data && typeof response.data === 'object') {
        if (response.data.success !== undefined) {
          console.log(`  Response: ${response.data.success ? 'Success' : 'Error'}`);
        }
        if (response.data.count !== undefined) {
          console.log(`  Count: ${response.data.count}`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}\n`);
    }
  }

  // Test summary
  console.log('📊 Test Results:');
  console.log(`  Passed: ${passedTests}/${totalTests}`);
  console.log(`  Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the API implementation.');
  }
}

// Check if server is running before testing
async function checkServer() {
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200) {
      console.log('🚀 Server is running! Starting tests...\n');
      await runTests();
    } else {
      console.log('❌ Server responded but health check failed');
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm run dev');
    console.log('\nThen run this test script again.');
  }
}

// Start testing
checkServer();
