const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const admin = require('firebase-admin')
const { body, validationResult } = require('express-validator')

const router = express.Router()
const db = admin.firestore()
const usersCollection = db.collection('users')

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  next()
}

// Login endpoint
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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
    const usersSnapshot = await usersCollection.where('username', '==', username).get()
    
    let user
    if (usersSnapshot.empty) {
      // Fallback: Check hardcoded users if database is empty
      if (username === 'admin' && password === 'A7sir123') {
        user = {
          id: 'admin-fallback',
          username: 'admin',
          name: 'System Administrator',
          role: 'admin'
        }
      } else if (username === 'user' && password === 'AmeraAirport1324') {
        user = {
          id: 'user-fallback',
          username: 'user',
          name: 'Client User',
          role: 'operator'
        }
      } else {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid username or password' 
        })
      }
    } else {
      const userDoc = usersSnapshot.docs[0]
      user = { id: userDoc.id, ...userDoc.data() }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid username or password' 
        })
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
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

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userDoc = await usersCollection.doc(req.user.id).get()
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    const user = userDoc.data()
    const { password, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: userWithoutPassword
    })

  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
})

// Get all users (Admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usersSnapshot = await usersCollection.get()
    const users = []

    usersSnapshot.forEach(doc => {
      const user = doc.data()
      const { password, ...userWithoutPassword } = user
      users.push({
        id: doc.id,
        ...userWithoutPassword
      })
    })

    res.json({
      success: true,
      data: users
    })

  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
})

// Create new user (Admin only)
router.post('/users', authenticateToken, requireAdmin, [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['admin', 'operator', 'viewer']).withMessage('Role must be admin, operator, or viewer')
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

    const { username, password, name, role } = req.body

    // Check if username already exists
    const existingUser = await usersCollection.where('username', '==', username).get()
    if (!existingUser.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const userData = {
      username,
      password: hashedPassword,
      name,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.id
    }

    const userRef = await usersCollection.add(userData)
    const { password: _, ...userWithoutPassword } = userData

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: userRef.id,
        ...userWithoutPassword
      }
    })

  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
})

// Update user (Admin only)
router.put('/users/:id', authenticateToken, requireAdmin, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('role').optional().isIn(['admin', 'operator', 'viewer']).withMessage('Role must be admin, operator, or viewer')
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

    const { id } = req.params
    const { name, role } = req.body

    const userRef = usersCollection.doc(id)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.id
    }

    if (name) updateData.name = name
    if (role) updateData.role = role

    await userRef.update(updateData)

    res.json({
      success: true,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
})

// Delete user (Admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      })
    }

    const userRef = usersCollection.doc(id)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    await userRef.delete()

    res.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
})

// Reset user password (Admin only)
router.put('/users/:id/reset-password', authenticateToken, requireAdmin, [
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { id } = req.params
    const { newPassword } = req.body

    const userRef = usersCollection.doc(id)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await userRef.update({
      password: hashedNewPassword,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.id
    })

    res.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
})

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body
    const userRef = usersCollection.doc(req.user.id)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    const user = userDoc.data()

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await userRef.update({
      password: hashedNewPassword,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    res.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
})

module.exports = { router, authenticateToken, requireAdmin }
