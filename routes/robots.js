const express = require('express')
const router = express.Router()

// In-memory storage for robots (replace with database later)
let robotsStore = []

// GET /api/robots - Get all robots
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      count: robotsStore.length,
      data: robotsStore
    })
  } catch (error) {
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
router.put('/:id', (req, res) => {
  try {
    const robotId = req.params.id
    console.log(`🤖 Robot registration request for ID: ${robotId}`)
    console.log(`📦 Request body:`, JSON.stringify(req.body, null, 2))
    console.log(`🌐 Client IP: ${req.ip}`)
    
    const robotIndex = robotsStore.findIndex(r => r.id === robotId)
    console.log(`🔍 Robot exists check: ${robotIndex === -1 ? 'NEW' : 'EXISTS'}`)
    
    if (robotIndex === -1) {
      // Robot doesn't exist, create new one (registration)
      console.log(`✅ Creating new robot: ${robotId}`)
      const newRobot = {
        id: robotId,
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
      
      robotsStore.push(newRobot)
      console.log(`🎉 Robot registered successfully! Total robots: ${robotsStore.length}`)
      
      res.json({
        success: true,
        message: 'Robot registered successfully',
        data: newRobot
      })
    } else {
      // Robot exists, update it
      console.log(`🔄 Updating existing robot: ${robotId}`)
      const updatedRobot = {
        ...robotsStore[robotIndex],
        ...req.body,
        lastSeen: new Date().toISOString()
      }

      robotsStore[robotIndex] = updatedRobot
      console.log(`✅ Robot updated successfully!`)

      res.json({
        success: true,
        message: 'Robot updated successfully',
        data: updatedRobot
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
router.post('/:id/heartbeat', (req, res) => {
  try {
    const robotId = req.params.id
    const { status, currentContent, batteryLevel, uptime } = req.body
    
    console.log(`💓 Heartbeat received from robot: ${robotId}`)
    console.log(`📊 Heartbeat data:`, JSON.stringify(req.body, null, 2))
    
    const robotIndex = robotsStore.findIndex(r => r.id === robotId)
    
    if (robotIndex === -1) {
      console.log(`❌ Heartbeat failed - Robot not found: ${robotId}`)
      return res.status(404).json({
        success: false,
        error: 'Robot not found'
      })
    }

    const robot = robotsStore[robotIndex]
    robot.status = status || robot.status
    robot.currentContent = currentContent || robot.currentContent
    robot.batteryLevel = batteryLevel !== undefined ? batteryLevel : robot.batteryLevel
    robot.uptime = uptime || robot.uptime
    robot.lastSeen = new Date().toISOString()

    console.log(`✅ Heartbeat processed for robot: ${robotId}`)
    console.log(`📱 Robot status: ${robot.status}, Battery: ${robot.batteryLevel}%`)

    res.json({
      success: true,
      message: 'Heartbeat received',
      data: robot
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
