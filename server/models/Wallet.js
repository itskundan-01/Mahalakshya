import mongoose from 'mongoose'

const walletSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  balance: { 
    type: Number, 
    default: 500000, // ₹5,00,000 default starting balance
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
})

// Middleware to update the updatedAt field on save
walletSchema.pre('save', function(next) {
  if (this.isModified('balance')) {
    this.updatedAt = Date.now()
  }
  next()
})

export default mongoose.model('Wallet', walletSchema)
