// filepath: /server/routes/trades.js
import express from 'express'
import auth from '../middleware/auth.js'
import Trade from '../models/Trade.js'

const router = express.Router()

// Buy Stock
router.post('/buy', auth, async (req, res) => {
  const { stockSymbol, quantity, price } = req.body
  try {
    const trade = new Trade({
      user: req.user,
      type: 'buy',
      stockSymbol,
      quantity,
      price,
    })
    await trade.save()
    res.status(201).json(trade)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Sell Stock
router.post('/sell', auth, async (req, res) => {
  const { stockSymbol, quantity, price } = req.body
  try {
    const trade = new Trade({
      user: req.user,
      type: 'sell',
      stockSymbol,
      quantity,
      price,
    })
    await trade.save()
    res.status(201).json(trade)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get User Trades
router.get('/', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user })
    res.json(trades)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router