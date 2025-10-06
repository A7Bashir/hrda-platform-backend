const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://lucky-selkie-4bb7ac.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}))
app.use(morgan('combined'))
app.use(limiter)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// In-memory storage for testing
let users = [
  {
    id: '1',
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: A7sir123
    name: 'System Administrator',
    role: 'admin',
    createdAt: new Date()
  },
  {
    id: '2',
    username: 'user',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: AmeraAirport1324
    name: 'Client User',
    role: 'operator',
    createdAt: new Date()
  }
]

// Simple authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' })
  }

  // For testing, accept any token
  req.user = { id: '1', username: 'admin', role: 'admin' }
  next()
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Backend server is running'
  })
})

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  
  const user = users.find(u => u.username === username)
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    })
  }

  // For testing, accept any password
  const token = 'test-token-' + Date.now()
  
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
      token
    }
  })
})

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: req.user
  })
})

// Robot status (mock data)
app.get('/api/robots', (req, res) => {
  res.json({
    success: true,
    data: []
  })
})

// Content routes (mock data)
app.get('/api/content', (req, res) => {
  res.json({
    success: true,
    data: []
  })
})

// Catch-all route for React app
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return next()
  }
  res.json({ message: 'Backend API is running' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔐 Test login: POST http://localhost:${PORT}/api/auth/login`)
  console.log('')
  console.log('Test credentials:')
  console.log('  Admin: username="admin", password="A7sir123"')
  console.log('  User: username="user", password="AmeraAirport1324"')
})
