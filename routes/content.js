const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const { addUpdate } = require('../stores/updatesStore')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/'
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only images and videos
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image and video files are allowed!'))
    }
  }
})

// In-memory storage for content metadata (replace with database later)
let contentStore = [
  {
    id: 'content_1',
    name: 'Welcome Image',
    type: 'image',
    filename: 'welcome-image.jpg',
    size: '2.1 MB',
    uploadedAt: new Date('2024-01-15').toISOString(),
    assignedRobots: ['robot_1', 'robot_2'],
    status: 'active'
  },
  {
    id: 'content_2',
    name: 'Product Video',
    type: 'video',
    filename: 'product-demo.mp4',
    size: '15.7 MB',
    uploadedAt: new Date('2024-01-16').toISOString(),
    assignedRobots: ['robot_1'],
    status: 'active'
  }
]

// GET /api/content - Get all content
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      count: contentStore.length,
      data: contentStore
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content'
    })
  }
})

// GET /api/content/:id - Get content by ID
router.get('/:id', (req, res) => {
  try {
    const content = contentStore.find(c => c.id === req.params.id)
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      })
    }
    
    res.json({
      success: true,
      data: content
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content'
    })
  }
})

// POST /api/content - Upload new content
router.post('/', upload.single('file'), (req, res) => {
  try {
    console.log('📁 Content upload request received')
    console.log('📦 Request body:', req.body)
    console.log('📎 File info:', req.file ? {
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size
    } : 'No file')
    
    if (!req.file) {
      console.log('❌ No file uploaded')
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    // Determine file type
    const fileExt = path.extname(req.file.originalname).toLowerCase()
    const isVideo = ['.mp4', '.avi', '.mov', '.wmv'].includes(fileExt)
    
    // Create content object
    const newContent = {
      id: `content_${Date.now()}`,
      name: req.body.title || req.body.name || req.file.originalname,
      type: isVideo ? 'video' : 'image',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: formatFileSize(req.file.size),
      uploadedAt: new Date().toISOString(),
      assignedRobots: req.body.assignedRobots ? req.body.assignedRobots.split(',').map(id => id.trim()) : [],
      status: 'active',
      filePath: req.file.path
    }

    contentStore.push(newContent)
    console.log('✅ Content stored successfully:', newContent.id)
    console.log('📊 Total content items:', contentStore.length)

    // Create update for assigned robots
    if (newContent.assignedRobots && newContent.assignedRobots.length > 0) {
      const updateId = `update_${Date.now()}`
      const update = {
        id: updateId,
        contentId: newContent.id,
        contentName: newContent.name,
        targetRobots: newContent.assignedRobots,
        status: 'pending',
        createdAt: new Date().toISOString(),
        priority: 'normal',
        type: 'content_update'
      }
      
      // Add to updates store
      addUpdate(update)
      console.log('📝 Creating update for robots:', newContent.assignedRobots)
      console.log('📋 Update details:', update)
    }

    res.status(201).json({
      success: true,
      message: 'Content uploaded successfully',
      data: newContent
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload content'
    })
  }
})

// PUT /api/content/:id - Update content
router.put('/:id', (req, res) => {
  try {
    const contentIndex = contentStore.findIndex(c => c.id === req.params.id)
    if (contentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      })
    }

    const updatedContent = {
      ...contentStore[contentIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    contentStore[contentIndex] = updatedContent

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: updatedContent
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update content'
    })
  }
})

// DELETE /api/content/:id - Delete content
router.delete('/:id', (req, res) => {
  try {
    const contentIndex = contentStore.findIndex(c => c.id === req.params.id)
    if (contentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      })
    }

    const content = contentStore[contentIndex]
    
    // Delete physical file if it exists
    if (content.filePath && fs.existsSync(content.filePath)) {
      fs.unlinkSync(content.filePath)
    }

    // Remove from store
    contentStore.splice(contentIndex, 1)

    res.json({
      success: true,
      message: 'Content deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete content'
    })
  }
})

// POST /api/content/:id/assign - Assign content to robots
router.post('/:id/assign', (req, res) => {
  try {
    const { robotIds } = req.body
    if (!robotIds || !Array.isArray(robotIds)) {
      return res.status(400).json({
        success: false,
        error: 'robotIds array is required'
      })
    }

    const content = contentStore.find(c => c.id === req.params.id)
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      })
    }

    content.assignedRobots = robotIds
    content.updatedAt = new Date().toISOString()

    res.json({
      success: true,
      message: 'Content assigned successfully',
      data: content
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to assign content'
    })
  }
})

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

module.exports = router
