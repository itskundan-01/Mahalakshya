// filepath: /server/routes/stocks.js
import express from 'express'
import { getRealTimePrice } from '../services/stockService.js'

const router = express.Router()

router.get('/price/:symbol', async (req, res) => {
  const { symbol } = req.params
  try {
    const priceData = await getRealTimePrice(symbol)
    res.json(priceData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock price' })
  }
})

export default router