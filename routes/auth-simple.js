const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// Simple hardcoded users for testing
const testUsers = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'A7sir123', // Plain text for testing
    name: 'System Administrator',
    role: 'admin'
  },
  {
    id: 'user-1',
    username: 'user',
    password: 'AmeraAirport1324', // Plain text for testing
    name: 'Client User',
    role: 'operator'
  }
]

// Login endpoint
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      })
    }

    const { username, password } = req.body

    // Find user by username
    const user = testUsers.find(u => u.username === username)
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      })
    }

    // Verify password (simple comparison for testing)
    if (password !== user.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        },
        token: token
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
})

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  })
})

module.exports = { router }
