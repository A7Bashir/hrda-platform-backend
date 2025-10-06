const express = require('express')
const admin = require('firebase-admin')
const router = express.Router()

// Initialize Firestore
const db = admin.firestore()
const robotsCollection = db.collection('robots')

// GET /api/robots - Get all robots
router.get('/', async (req, res) => {
  try {
    const snapshot = await robotsCollection.get()
    const robots = []
    
    snapshot.forEach(doc => {
      robots.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    res.json({
      success: true,
      count: robots.length,
      data: robots
    })
  } catch (error) {
    console.error('Error fetching robots:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch robots'
    })
  }
})

// GET /api/robots/:id - Get robot by ID
router.get('/:id', (req, res) => {
  try {
    const robot = robotsStore.find(r => r.id === req.params.id)
    if (!robot) {
      return res.status(404).json({
        success: false,
        error: 'Robot not found'
      })
    }
    
    res.json({
      success: true,
      data: robot
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch robot'
    })
  }
})

// PUT /api/robots/:id - Register or update robot
router.put('/:id', async (req, res) => {
  try {
    const robotId = req.params.id
    console.log(`🤖 Robot registration request for ID: ${robotId}`)
    console.log(`📦 Request body:`, JSON.stringify(req.body, null, 2))
    console.log(`🌐 Client IP: ${req.ip}`)
    
    const robotRef = robotsCollection.doc(robotId)
    const robotDoc = await robotRef.get()
    
    if (!robotDoc.exists) {
      // Robot doesn't exist, create new one (registration)
      console.log(`✅ Creating new robot: ${robotId}`)
      const newRobot = {
        name: req.body.name || `Robot ${robotId}`,
        status: 'online',
        lastSeen: new Date().toISOString(),
        currentContent: 'Welcome',
        location: 'Unknown',
        ipAddress: req.ip || 'Unknown',
        version: '1.0.0',
        batteryLevel: 100,
        uptime: '0 days, 0 hours',
        device: req.body.device || 'Unknown Device',
        ...req.body
      }
      
      await robotRef.set(newRobot)
      console.log(`🎉 Robot registered successfully!`)
      
      res.json({
        success: true,
        message: 'Robot registered successfully',
        data: { id: robotId, ...newRobot }
      })
    } else {
      // Robot exists, update it
      console.log(`🔄 Updating existing robot: ${robotId}`)
      const updateData = {
        ...req.body,
        lastSeen: new Date().toISOString()
      }

      await robotRef.update(updateData)
      console.log(`✅ Robot updated successfully!`)

      // Get updated robot data
      const updatedDoc = await robotRef.get()
      res.json({
        success: true,
        message: 'Robot updated successfully',
        data: { id: robotId, ...updatedDoc.data() }
      })
    }
  } catch (error) {
    console.error(`❌ Robot registration error:`, error)
    res.status(500).json({
      success: false,
      error: 'Failed to register/update robot'
    })
  }
})

// POST /api/robots/:id/heartbeat - Robot heartbeat/status update
router.post('/:id/heartbeat', async (req, res) => {
  try {
    const robotId = req.params.id
    const { status, currentContent, batteryLevel, uptime } = req.body
    
    console.log(`💓 Heartbeat received from robot: ${robotId}`)
    console.log(`📊 Heartbeat data:`, JSON.stringify(req.body, null, 2))
    
    const robotRef = robotsCollection.doc(robotId)
    const robotDoc = await robotRef.get()
    
    if (!robotDoc.exists) {
      console.log(`❌ Heartbeat failed - Robot not found: ${robotId}`)
      return res.status(404).json({
        success: false,
        error: 'Robot not found'
      })
    }

    const updateData = {
      status: status || robotDoc.data().status,
      currentContent: currentContent || robotDoc.data().currentContent,
      batteryLevel: batteryLevel !== undefined ? batteryLevel : robotDoc.data().batteryLevel,
      uptime: uptime || robotDoc.data().uptime,
      lastSeen: new Date().toISOString()
    }

    await robotRef.update(updateData)

    console.log(`✅ Heartbeat processed for robot: ${robotId}`)
    console.log(`📱 Robot status: ${updateData.status}, Battery: ${updateData.batteryLevel}%`)

    // Get updated robot data
    const updatedDoc = await robotRef.get()
    res.json({
      success: true,
      message: 'Heartbeat received',
      data: { id: robotId, ...updatedDoc.data() }
    })
  } catch (error) {
    console.error(`❌ Heartbeat error for robot ${req.params.id}:`, error)
    res.status(500).json({
      success: false,
      error: 'Failed to process heartbeat'
    })
  }
})

// POST /api/robots/:id/content - Update robot's current content
router.post('/:id/content', (req, res) => {
  try {
    const { contentId, contentName } = req.body
    const robotIndex = robotsStore.findIndex(r => r.id === req.params.id)
    
    if (robotIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Robot not found'
      })
    }

    const robot = robotsStore[robotIndex]
    robot.currentContent = contentName || 'Unknown Content'
    robot.lastSeen = new Date().toISOString()

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: robot
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update content'
    })
  }
})

// GET /api/robots/status/summary - Get robots status summary
router.get('/status/summary', (req, res) => {
  try {
    const totalRobots = robotsStore.length
    const onlineRobots = robotsStore.filter(r => r.status === 'online').length
    const offlineRobots = totalRobots - onlineRobots
    
    const summary = {
      total: totalRobots,
      online: onlineRobots,
      offline: offlineRobots,
      onlinePercentage: Math.round((onlineRobots / totalRobots) * 100),
      lastUpdate: new Date().toISOString()
    }

    res.json({
      success: true,
      data: summary
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch status summary'
    })
  }
})

// POST /api/robots/bulk-update - Bulk update multiple robots
router.post('/bulk-update', (req, res) => {
  try {
    const { updates } = req.body
    
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        error: 'Updates array is required'
      })
    }

    const results = []
    
    updates.forEach(update => {
      const robotIndex = robotsStore.findIndex(r => r.id === update.robotId)
      if (robotIndex !== -1) {
        robotsStore[robotIndex] = {
          ...robotsStore[robotIndex],
          ...update.data,
          lastSeen: new Date().toISOString()
        }
        results.push({
          robotId: update.robotId,
          status: 'updated'
        })
      } else {
        results.push({
          robotId: update.robotId,
          status: 'not_found'
        })
      }
    })

    res.json({
      success: true,
      message: 'Bulk update completed',
      data: results
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk update'
    })
  }
})

module.exports = router
