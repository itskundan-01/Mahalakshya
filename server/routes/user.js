// filepath: /server/routes/user.js
import express from 'express'
import auth from '../middleware/auth.js'
import User from '../models/User.js'
import bcrypt from 'bcrypt'

const router = express.Router()

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body
    
    // Find user and update
    const user = await User.findById(req.user)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Update fields
    if (name) user.name = name
    if (phone) user.phone = phone
    
    await user.save()
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user).select('-password')
    res.json(updatedUser)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    
    // Find user
    const user = await User.findById(req.user)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' })
    }
    
    // Update password
    user.password = newPassword
    await user.save()
    
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router