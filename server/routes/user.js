// filepath: /server/routes/user.js
import express from 'express'
import auth from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router