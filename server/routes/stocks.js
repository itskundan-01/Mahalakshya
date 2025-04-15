// filepath: /server/routes/stocks.js
import express from 'express'
import { getRealTimePrice, getStockPriceOnly } from '../services/stockService.js'

const router = express.Router()

// Route to get full stock details (used by StockDetails page)
router.get('/price/:symbol', async (req, res) => {
  const { symbol } = req.params
  try {
    const priceData = await getRealTimePrice(symbol)
    res.json(priceData)
  } catch (error) {
    console.error(`Route error for ${symbol}:`, error.message)
    res.status(500).json({ error: error.message || 'Failed to fetch stock price' })
  }
})

// Optimized route that fetches only price (for StockPrice page)
router.get('/priceonly/:symbol', async (req, res) => {
  const { symbol } = req.params
  try {
    const priceData = await getStockPriceOnly(symbol)
    res.json(priceData)
  } catch (error) {
    console.error(`Price-only route error for ${symbol}:`, error.message)
    res.status(500).json({ error: error.message || 'Failed to fetch stock price' })
  }
})

export default router