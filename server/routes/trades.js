import express from 'express'
import auth from '../middleware/auth.js'
import Trade from '../models/Trade.js'
import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js' 
import mongoose from 'mongoose'

const router = express.Router()

// Helper function to get or create a wallet
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId })
  
  if (!wallet) {
    wallet = new Wallet({ user: userId })
    await wallet.save()
  }
  
  return wallet
}

// Buy Stock
router.post('/buy', auth, async (req, res) => {
  try {
    const { stockSymbol, quantity, price } = req.body
    const totalCost = quantity * price
    
    // Get user wallet
    const wallet = await getOrCreateWallet(req.user)
    
    // Check if user has enough balance
    if (wallet.balance < totalCost) {
      return res.status(400).json({ 
        error: 'Insufficient funds in wallet',
        walletBalance: wallet.balance,
        required: totalCost  
      })
    }
    
    // Record previous balance
    const balanceBefore = wallet.balance
    
    // Create trade
    const trade = new Trade({
      user: req.user,
      type: 'buy',
      stockSymbol,
      quantity,
      price,
    })
    await trade.save()
    
    // Update wallet
    wallet.balance -= totalCost
    await wallet.save()
    
    // Record transaction
    const transaction = new Transaction({
      user: req.user,
      amount: -totalCost,
      type: 'buy',
      referenceId: trade._id,
      description: `Bought ${quantity} shares of ${stockSymbol}`,
      balanceBefore,
      balanceAfter: wallet.balance
    })
    await transaction.save()
    
    res.status(201).json({
      ...trade.toObject(),
      walletBalance: wallet.balance
    })
    
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Sell Stock
router.post('/sell', auth, async (req, res) => {
  try {
    const { stockSymbol, quantity, price } = req.body
    const saleProceeds = quantity * price
    
    // Get user wallet
    const wallet = await getOrCreateWallet(req.user)
    
    // Verify user has these stocks (in a real app)
    // This would check holdings table or aggregate buy/sell trades
    
    // Record previous balance
    const balanceBefore = wallet.balance
    
    // Create trade
    const trade = new Trade({
      user: req.user,
      type: 'sell',
      stockSymbol,
      quantity,
      price,
    })
    await trade.save()
    
    // Update wallet
    wallet.balance += saleProceeds
    await wallet.save()
    
    // Record transaction
    const transaction = new Transaction({
      user: req.user,
      amount: saleProceeds,
      type: 'sell',
      referenceId: trade._id,
      description: `Sold ${quantity} shares of ${stockSymbol}`,
      balanceBefore,
      balanceAfter: wallet.balance
    })
    await transaction.save()
    
    res.status(201).json({
      ...trade.toObject(),
      walletBalance: wallet.balance
    })
    
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