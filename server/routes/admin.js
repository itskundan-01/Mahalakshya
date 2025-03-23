//// filepath: /server/routes/admin.js
import express from 'express'
import auth from '../middleware/auth.js'
import User from '../models/User.js'
import Trade from '../models/Trade.js'

const router = express.Router()

// Dummy admin stats. In a real app, add proper admin authentication/authorization.
router.get('/stats', auth, async (req, res) => {
  try {
    // For simplicity, no admin check here.
    const userCount = await User.countDocuments()
    const tradeCount = await Trade.countDocuments()
    res.json({ userCount, tradeCount })
  } catch (error) {
    res.status(500).json({ error: 'Error fetching admin stats' })
  }
})

export default router