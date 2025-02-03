// filepath: /server/routes/2fa.js
import express from 'express'
import auth from '../middleware/auth.js'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import User from '../models/User.js'

const router = express.Router()

// Generate 2FA Secret and QR Code
router.get('/generate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user)
    // If 2FA secret already exists, do not generate a new one.
    if (user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA is already set up for this account.' })
    }
    const secret = speakeasy.generateSecret({ length: 20 })
    const url = speakeasy.otpauthURL({ secret: secret.base32, label: `Mahalakshya (${req.user})`, issuer: 'Mahalakshya' })
    const qrCode = await qrcode.toDataURL(url)
    await User.findByIdAndUpdate(req.user, { twoFactorSecret: secret.base32 })
    res.json({ qrCode, secret: secret.base32 })
  } catch (err) {
    console.error('Error generating 2FA code:', err)
    res.status(500).json({ error: 'Error generating 2FA code.' })
  }
})

// Verify 2FA Token
router.post('/verify', auth, async (req, res) => {
  const { token } = req.body
  try {
    const user = await User.findById(req.user)
    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is already enabled for this account.' })
    }
    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA secret not set for this account.' })
    }
    
    const expectedToken = speakeasy.totp({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      window: 2
    })
    console.log('Expected Token:', expectedToken, '| Provided:', token.trim())

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token.trim(),
      window: 2
    })
    if (verified) {
      user.twoFactorEnabled = true
      await user.save()
      res.json({ message: '2FA enabled successfully.' })
    } else {
      res.status(400).json({ error: 'Invalid token entered.' })
    }
  } catch (err) {
    console.error('Error verifying 2FA token:', err)
    res.status(500).json({ error: 'Error verifying 2FA token.' })
  }
})

export default router