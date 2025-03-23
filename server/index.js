// filepath: /server/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import tradeRoutes from './routes/trades.js'
import stockRoutes from './routes/stocks.js'
import twoFARoutes from './routes/2fa.js'
import adminRoutes from './routes/admin.js'
import walletRoutes from './routes/wallet.js'  // Add this line

dotenv.config()

const app = express()

app.use(cors({
  origin: true, // or specify your client URL like 'http://localhost:3000'
  credentials: true
}));
app.use(express.json())

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/trades', tradeRoutes)
app.use('/api/stocks', stockRoutes)
app.use('/api/2fa', twoFARoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/wallet', walletRoutes)  // Add this line

app.get('/', (req, res) => {
  res.send('Server is running')
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))