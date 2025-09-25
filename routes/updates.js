const express = require('express')
const router = express.Router()
const { getUpdatesStore, getUpdatesForRobot, markUpdateAsProcessed } = require('../stores/updatesStore')

// In-memory storage for updates (replace with database later)
let updatesStore = getUpdatesStore()

// Add some initial updates for testing
if (updatesStore.length === 0) {
  updatesStore.push(
    {
      id: 'update_1',
      contentId: 'content_1',
      contentName: 'Welcome Image',
      targetRobots: ['robot_1', 'robot_2'],
    status: 'completed',
    createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
    completedAt: new Date('2024-01-15T10:05:00Z').toISOString(),
    priority: 'normal',
    type: 'content_update'
  },
  {
    id: 'update_2',
    contentId: 'content_2',
    contentName: 'Product Video',
    targetRobots: ['robot_1'],
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    completedAt: null,
    priority: 'high',
    type: 'content_update'
  }
  )
}

// GET /api/updates - Get all updates
router.get('/', (req, res) => {
  try {
    const { status, robotId, limit = 50 } = req.query
    
    let filteredUpdates = [...updatesStore]
    
    // Filter by status
    if (status) {
      filteredUpdates = filteredUpdates.filter(u => u.status === status)
    }
    
    // Filter by robot
    if (robotId) {
      filteredUpdates = filteredUpdates.filter(u => u.targetRobots.includes(robotId))
    }
    
    // Apply limit
    if (limit) {
      filteredUpdates = filteredUpdates.slice(0, parseInt(limit))
    }
    
    res.json({
      success: true,
      count: filteredUpdates.length,
      data: filteredUpdates
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch updates'
    })
  }
})

// GET /api/updates/:id - Get update by ID
router.get('/:id', (req, res) => {
  try {
    const update = updatesStore.find(u => u.id === req.params.id)
    if (!update) {
      return res.status(404).json({
        success: false,
        error: 'Update not found'
      })
    }
    
    res.json({
      success: true,
      data: update
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch update'
    })
  }
})

// POST /api/updates - Send content update to robots
router.post('/', (req, res) => {
  try {
    const { contentId, contentName, targetRobots, priority = 'normal', type = 'content_update' } = req.body
    
    if (!contentId || !contentName || !targetRobots || !Array.isArray(targetRobots)) {
      return res.status(400).json({
        success: false,
        error: 'contentId, contentName, and targetRobots array are required'
      })
    }

    const newUpdate = {
      id: `update_${Date.now()}`,
      contentId,
      contentName,
      targetRobots,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
      priority,
      type,
      progress: {
        total: targetRobots.length,
        completed: 0,
        failed: 0,
        pending: targetRobots.length
      }
    }

    updatesStore.push(newUpdate)

    // Simulate update processing
    setTimeout(() => {
      const updateIndex = updatesStore.findIndex(u => u.id === newUpdate.id)
      if (updateIndex !== -1) {
        updatesStore[updateIndex].status = 'in_progress'
        updatesStore[updateIndex].progress.pending = 0
        updatesStore[updateIndex].progress.completed = targetRobots.length
      }
    }, 2000)

    res.status(201).json({
      success: true,
      message: 'Update queued successfully',
      data: newUpdate
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create update'
    })
  }
})

// PUT /api/updates/:id/status - Update status
router.put('/:id/status', (req, res) => {
  try {
    const { status, robotId, message } = req.body
    const updateIndex = updatesStore.findIndex(u => u.id === req.params.id)
    
    if (updateIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Update not found'
      })
    }

    const update = updatesStore[updateIndex]
    
    if (status === 'completed' && robotId) {
      // Mark specific robot as completed
      if (!update.progress.completedRobots) {
        update.progress.completedRobots = []
      }
      update.progress.completedRobots.push(robotId)
      update.progress.completed++
      update.progress.pending--
      
      // Check if all robots are completed
      if (update.progress.completed === update.progress.total) {
        update.status = 'completed'
        update.completedAt = new Date().toISOString()
      }
    } else {
      update.status = status
      if (status === 'completed') {
        update.completedAt = new Date().toISOString()
      }
    }

    if (message) {
      if (!update.messages) update.messages = []
      update.messages.push({
        timestamp: new Date().toISOString(),
        message,
        robotId
      })
    }

    res.json({
      success: true,
      message: 'Update status updated successfully',
      data: update
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update status'
    })
  }
})

// DELETE /api/updates/:id - Cancel update
router.delete('/:id', (req, res) => {
  try {
    const updateIndex = updatesStore.findIndex(u => u.id === req.params.id)
    if (updateIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Update not found'
      })
    }

    const update = updatesStore[updateIndex]
    
    // Only allow cancellation of pending or in_progress updates
    if (update.status === 'completed' || update.status === 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel completed or failed updates'
      })
    }

    update.status = 'cancelled'
    update.cancelledAt = new Date().toISOString()

    res.json({
      success: true,
      message: 'Update cancelled successfully',
      data: update
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel update'
    })
  }
})

// GET /api/updates/robot/:robotId - Get updates for specific robot
router.get('/robot/:robotId', (req, res) => {
  try {
    const { robotId } = req.params
    const robotUpdates = updatesStore.filter(u => u.targetRobots.includes(robotId))
    
    res.json({
      success: true,
      count: robotUpdates.length,
      data: robotUpdates
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch robot updates'
    })
  }
})

// GET /api/updates/status/summary - Get updates status summary
router.get('/status/summary', (req, res) => {
  try {
    const totalUpdates = updatesStore.length
    const pendingUpdates = updatesStore.filter(u => u.status === 'pending').length
    const inProgressUpdates = updatesStore.filter(u => u.status === 'in_progress').length
    const completedUpdates = updatesStore.filter(u => u.status === 'completed').length
    const failedUpdates = updatesStore.filter(u => u.status === 'failed').length
    const cancelledUpdates = updatesStore.filter(u => u.status === 'cancelled').length

    const summary = {
      total: totalUpdates,
      pending: pendingUpdates,
      inProgress: inProgressUpdates,
      completed: completedUpdates,
      failed: failedUpdates,
      cancelled: cancelledUpdates,
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

module.exports = router
