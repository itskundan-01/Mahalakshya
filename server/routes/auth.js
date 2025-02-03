// filepath: /server/routes/auth.js
import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body
  try {
    const user = new User({ name, email, password, phone })
    await user.save()
    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

    // Exclude password from user details before sending
    const { password: pwd, ...userWithoutPassword } = user.toObject()

    res.json({ token, user: userWithoutPassword })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router