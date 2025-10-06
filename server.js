const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')
const admin = require('firebase-admin')

// Initialize Firebase Admin SDK
let serviceAccount
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: Use environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
} else {
  // Development: Use local file
  serviceAccount = require('./serviceAccountKey.json')
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'hrda-463712'
})

const db = admin.firestore()

const app = express()
const PORT = process.env.PORT || 3000

// Rate limiting - More generous for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased from 100)
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(helmet())

// CORS configuration to allow Netlify frontend
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'http://localhost:3000', // Local development
    'https://lucky-selkie-4bb7ac.netlify.app', // Your Netlify domain
    'https://*.netlify.app' // All Netlify domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}

app.use(cors(corsOptions))
app.use(morgan('combined'))
app.use(limiter)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Serve React app static assets
app.use('/assets', express.static(path.join(__dirname, '../frontend/dist/assets')))
app.use('/vite.svg', express.static(path.join(__dirname, '../frontend/dist/vite.svg')))

// Routes
app.use('/api/auth', require('./routes/auth').router)
app.use('/api/robots', require('./routes/robots'))
app.use('/api/content', require('./routes/content'))
app.use('/api/updates', require('./routes/updates'))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'HRDA Platform API',
    version: '1.0.0',
    description: 'Multi-Robot Big Screen Management Platform',
    endpoints: {
      robots: '/api/robots',
      content: '/api/content',
      updates: '/api/updates',
      health: '/health'
    },
    status: 'operational'
  })
})

// Serve React app for all non-API routes (for client-side routing)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return next()
  }
  
  // Serve the React app for all other routes
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api',
      'GET /api/robots',
      'GET /api/content',
      'GET /api/updates'
    ]
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error)
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large. Maximum size is 50MB.'
    })
  }
  
  if (error.message === 'Only image and video files are allowed!') {
    return res.status(400).json({
      success: false,
      error: error.message
    })
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HRDA Platform API running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`📚 API docs: http://localhost:${PORT}/api`)
  console.log(`🤖 Robots endpoint: http://localhost:${PORT}/api/robots`)
  console.log(`📁 Content endpoint: http://localhost:${PORT}/api/content`)
  console.log(`🔄 Updates endpoint: http://localhost:${PORT}/api/updates`)
})
