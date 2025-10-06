// Test script to create users via direct API call
const https = require('https')

console.log('🚀 Testing user creation via API...')

// First, let's try to call the init-users endpoint
const initData = JSON.stringify({})

const initOptions = {
  hostname: 'hrda-platform-api.onrender.com',
  port: 443,
  path: '/api/init-users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': initData.length
  }
}

console.log('📡 Calling init-users endpoint...')

const initReq = https.request(initOptions, (res) => {
  console.log(`📊 Init endpoint status: ${res.statusCode}`)
  
  let responseData = ''
  res.on('data', (chunk) => {
    responseData += chunk
  })
  
  res.on('end', () => {
    console.log('📋 Init response:', responseData)
    
    // If init-users doesn't work, try creating users directly
    if (res.statusCode === 404) {
      console.log('🔄 Init endpoint not available, trying direct user creation...')
      createUserDirectly()
    }
  })
})

initReq.on('error', (error) => {
  console.error('❌ Init request error:', error.message)
  console.log('🔄 Trying direct user creation...')
  createUserDirectly()
})

initReq.write(initData)
initReq.end()

function createUserDirectly() {
  // Try to create a user via the auth register endpoint
  const userData = JSON.stringify({
    username: 'admin',
    password: 'A7sir123',
    name: 'System Administrator',
    role: 'admin'
  })

  const userOptions = {
    hostname: 'hrda-platform-api.onrender.com',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': userData.length
    }
  }

  console.log('📡 Calling register endpoint...')

  const userReq = https.request(userOptions, (res) => {
    console.log(`📊 Register status: ${res.statusCode}`)
    
    let responseData = ''
    res.on('data', (chunk) => {
      responseData += chunk
    })
    
    res.on('end', () => {
      console.log('📋 Register response:', responseData)
    })
  })

  userReq.on('error', (error) => {
    console.error('❌ Register request error:', error.message)
  })

  userReq.write(userData)
  userReq.end()
}
