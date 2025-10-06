// Simple test to check if auth routes are working
const express = require('express')
const app = express()

app.use(express.json())

// Simple test route
app.post('/api/auth/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  })
})

// Simple login test
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  
  if (username === 'admin' && password === 'A7sir123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: 'admin-test',
          username: 'admin',
          name: 'System Administrator',
          role: 'admin'
        },
        token: 'test-token-123'
      }
    })
  } else if (username === 'user' && password === 'AmeraAirport1324') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: 'user-test',
          username: 'user',
          name: 'Client User',
          role: 'operator'
        },
        token: 'test-token-456'
      }
    })
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Test auth server running on port ${PORT}`)
  console.log(`📍 Test login: POST http://localhost:${PORT}/api/auth/login`)
})
