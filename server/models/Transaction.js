import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['deposit', 'withdrawal', 'buy', 'sell'],
    required: true 
  },
  referenceId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade' 
  },
  description: { 
    type: String,
    required: true
  },
  balanceBefore: { 
    type: Number, 
    required: true 
  },
  balanceAfter: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
})

export default mongoose.model('Transaction', transactionSchema)
