const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const admin = require('firebase-admin')
const router = express.Router()
const { addUpdate } = require('../stores/updatesStore')

// Initialize Firestore
const db = admin.firestore()
const contentCollection = db.collection('content')
const schedulesCollection = db.collection('schedules')

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

// Content data is now stored in Firestore

// GET /api/content - Get all content
router.get('/', async (req, res) => {
  try {
    const snapshot = await contentCollection.get()
    const content = []
    snapshot.forEach(doc => {
      content.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    res.json({
      success: true,
      count: content.length,
      data: content
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content'
    })
  }
})

// GET /api/content/:id - Get content by ID
router.get('/:id', async (req, res) => {
  try {
    const contentDoc = await contentCollection.doc(req.params.id).get()
    if (!contentDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      })
    }
    
    res.json({
      success: true,
      data: {
        id: contentDoc.id,
        ...contentDoc.data()
      }
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content'
    })
  }
})

// POST /api/content - Upload new content
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    // Determine file type
    const fileExt = path.extname(req.file.originalname).toLowerCase()
    const isVideo = ['.mp4', '.avi', '.mov', '.wmv'].includes(fileExt)
    
    // Create content object
    const contentId = `content_${Date.now()}`
    const newContent = {
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

    // Store in Firestore
    await contentCollection.doc(contentId).set(newContent)

    // Create update for assigned robots
    if (newContent.assignedRobots && newContent.assignedRobots.length > 0) {
      const updateId = `update_${Date.now()}`
      const update = {
        id: updateId,
        contentId: contentId,
        contentName: newContent.name,
        targetRobots: newContent.assignedRobots,
        status: 'pending',
        createdAt: new Date().toISOString(),
        priority: 'normal',
        type: 'content_update'
      }
      
      // Add to updates store
      addUpdate(update)
    }

    res.status(201).json({
      success: true,
      message: 'Content uploaded successfully',
      data: {
        id: contentId,
        ...newContent
      }
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
router.put('/:id', async (req, res) => {
  try {
    const contentRef = contentCollection.doc(req.params.id)
    const contentDoc = await contentRef.get()
    
    if (!contentDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      })
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    await contentRef.update(updateData)
    const updatedDoc = await contentRef.get()

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: {
        id: contentDoc.id,
        ...updatedDoc.data()
      }
    })
  } catch (error) {
    console.error('Error updating content:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update content'
    })
  }
})

// DELETE /api/content/:id - Delete content
router.delete('/:id', async (req, res) => {
  try {
    const contentRef = contentCollection.doc(req.params.id)
    const contentDoc = await contentRef.get()
    
    if (!contentDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      })
    }

    const content = contentDoc.data()
    
    // Delete physical file if it exists
    if (content.filePath && fs.existsSync(content.filePath)) {
      fs.unlinkSync(content.filePath)
    }

    // Remove from Firestore
    await contentRef.delete()

    res.json({
      success: true,
      message: 'Content deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting content:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete content'
    })
  }
})

// POST /api/content/:id/assign - Assign content to robots
router.post('/:id/assign', async (req, res) => {
  try {
    const { robotIds } = req.body
    if (!robotIds || !Array.isArray(robotIds)) {
      return res.status(400).json({
        success: false,
        error: 'robotIds array is required'
      })
    }

    const contentRef = contentCollection.doc(req.params.id)
    const contentDoc = await contentRef.get()
    
    if (!contentDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      })
    }

    const updateData = {
      assignedRobots: robotIds,
      updatedAt: new Date().toISOString()
    }

    await contentRef.update(updateData)
    const updatedDoc = await contentRef.get()

    res.json({
      success: true,
      message: 'Content assigned successfully',
      data: {
        id: contentDoc.id,
        ...updatedDoc.data()
      }
    })
  } catch (error) {
    console.error('Error assigning content:', error)
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

// ==================== SCHEDULING ROUTES ====================

// GET /api/content/schedules - Get all schedules
router.get('/schedules', async (req, res) => {
  try {
    const snapshot = await schedulesCollection.get()
    const schedules = []
    snapshot.forEach(doc => {
      schedules.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    res.json({
      success: true,
      count: schedules.length,
      data: schedules
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedules'
    })
  }
})

// POST /api/content/schedules - Create new schedule
router.post('/schedules', async (req, res) => {
  try {
    const {
      contentId,
      name,
      description,
      scheduledDate,
      scheduledTime,
      targetRobots,
      scheduleType, // 'once', 'daily', 'weekly', 'monthly'
      recurrencePattern, // For recurring schedules
      status // 'pending', 'active', 'completed', 'cancelled'
    } = req.body

    // Validate required fields
    if (!contentId || !scheduledDate || !scheduledTime || !targetRobots) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: contentId, scheduledDate, scheduledTime, targetRobots'
      })
    }

    // Create schedule object
    const scheduleId = `schedule_${Date.now()}`
    const newSchedule = {
      contentId,
      name: name || `Schedule for ${contentId}`,
      description: description || '',
      scheduledDate,
      scheduledTime,
      targetRobots: Array.isArray(targetRobots) ? targetRobots : [targetRobots],
      scheduleType: scheduleType || 'once',
      recurrencePattern: recurrencePattern || null,
      status: status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executedAt: null
    }

    // Store in Firestore
    await schedulesCollection.doc(scheduleId).set(newSchedule)

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: {
        id: scheduleId,
        ...newSchedule
      }
    })
  } catch (error) {
    console.error('Error creating schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create schedule'
    })
  }
})

// PUT /api/content/schedules/:id - Update schedule
router.put('/schedules/:id', async (req, res) => {
  try {
    const scheduleRef = schedulesCollection.doc(req.params.id)
    const scheduleDoc = await scheduleRef.get()
    
    if (!scheduleDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      })
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    await scheduleRef.update(updateData)
    const updatedDoc = await scheduleRef.get()

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: {
        id: scheduleDoc.id,
        ...updatedDoc.data()
      }
    })
  } catch (error) {
    console.error('Error updating schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update schedule'
    })
  }
})

// DELETE /api/content/schedules/:id - Delete schedule
router.delete('/schedules/:id', async (req, res) => {
  try {
    const scheduleRef = schedulesCollection.doc(req.params.id)
    const scheduleDoc = await scheduleRef.get()
    
    if (!scheduleDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      })
    }

    await scheduleRef.delete()

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete schedule'
    })
  }
})

// POST /api/content/schedules/:id/execute - Execute schedule immediately
router.post('/schedules/:id/execute', async (req, res) => {
  try {
    const scheduleRef = schedulesCollection.doc(req.params.id)
    const scheduleDoc = await scheduleRef.get()
    
    if (!scheduleDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      })
    }

    const schedule = scheduleDoc.data()
    
    // Get the content
    const contentDoc = await contentCollection.doc(schedule.contentId).get()
    if (!contentDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      })
    }

    const content = contentDoc.data()

    // Create update for assigned robots
    const updateId = `update_${Date.now()}`
    const update = {
      id: updateId,
      contentId: schedule.contentId,
      contentName: content.name,
      targetRobots: schedule.targetRobots,
      status: 'pending',
      createdAt: new Date().toISOString(),
      priority: 'high',
      type: 'scheduled_content_update',
      scheduleId: req.params.id
    }
    
    // Add to updates store
    addUpdate(update)

    // Update schedule status
    await scheduleRef.update({
      status: 'completed',
      executedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })


    res.json({
      success: true,
      message: 'Schedule executed successfully',
      data: {
        scheduleId: req.params.id,
        updateId: updateId,
        content: {
          id: contentDoc.id,
          ...content
        }
      }
    })
  } catch (error) {
    console.error('Error executing schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to execute schedule'
    })
  }
})

module.exports = router
