// Simple script to create users via API call
const https = require('https')

const data = JSON.stringify({
  username: 'admin',
  password: 'A7sir123',
  name: 'System Administrator',
  role: 'admin'
})

const options = {
  hostname: 'hrda-platform-api.onrender.com',
  port: 443,
  path: '/api/init-users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`)
  
  let responseData = ''
  res.on('data', (chunk) => {
    responseData += chunk
  })
  
  res.on('end', () => {
    console.log('Response:', responseData)
  })
})

req.on('error', (error) => {
  console.error('Error:', error)
})

req.write(data)
req.end()
