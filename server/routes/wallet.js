import express from 'express'
import auth from '../middleware/auth.js'
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

// Get wallet details
router.get('/', auth, async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user)
    res.json(wallet)
  } catch (error) {
    console.error('Error fetching wallet:', error)
    res.status(500).json({ error: 'Error fetching wallet details' })
  }
})

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Make logging less verbose
    // console.log(`Fetching transactions for user ${req.user} (page ${page}, limit ${limit})`)
    
    // Get total count for pagination info
    const totalCount = await Transaction.countDocuments({ user: req.user });
    
    const transactions = await Transaction.find({ user: req.user })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Make logging less verbose
    // console.log(`Found ${transactions.length} transactions out of ${totalCount} total`)
    
    res.json({
      transactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transaction history' })
  }
})

// Add virtual funds (deposit)
router.post('/deposit', auth, async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  
  try {
    const { amount } = req.body
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid deposit amount required' })
    }
    
    // Get or create the wallet
    const wallet = await getOrCreateWallet(req.user)
    
    // Store previous balance
    const balanceBefore = wallet.balance
    
    // Update wallet balance
    wallet.balance += parseFloat(amount)
    await wallet.save({ session })
    
    // Record transaction
    const transaction = new Transaction({
      user: req.user,
      amount: parseFloat(amount),
      type: 'deposit',
      description: 'Virtual funds deposit',
      balanceBefore,
      balanceAfter: wallet.balance
    })
    
    await transaction.save({ session })
    
    await session.commitTransaction()
    
    res.json({
      message: 'Deposit successful',
      wallet,
      transaction
    })
    
  } catch (error) {
    await session.abortTransaction()
    console.error('Deposit error:', error)
    res.status(500).json({ error: 'Error processing deposit' })
  } finally {
    session.endSession()
  }
})

export default router
