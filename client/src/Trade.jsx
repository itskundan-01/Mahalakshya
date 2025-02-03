import { useState } from 'react'
import axios from 'axios'
import { API_URL } from './config'
import { toast } from 'react-toastify'

function Trade() {
  const [stockSymbol, setStockSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [tradeType, setTradeType] = useState('buy')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      const endpoint = tradeType === 'buy' ? '/trades/buy' : '/trades/sell'
      const res = await axios.post(`${API_URL}${endpoint}`, { stockSymbol, quantity, price }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const successMsg = `Trade successful: ${res.data.type} ${res.data.quantity} shares of ${res.data.stockSymbol}`
      setMessage(successMsg)
      toast.success(successMsg)
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Trade failed'
      setMessage(errMsg)
      toast.error(errMsg)
    }
  }

  return (
    <div>
      <h2>{tradeType === 'buy' ? 'Buy Stock' : 'Sell Stock'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <input type="radio" value="buy" checked={tradeType === 'buy'} onChange={() => setTradeType('buy')} />
            Buy
          </label>
          <label>
            <input type="radio" value="sell" checked={tradeType === 'sell'} onChange={() => setTradeType('sell')} />
            Sell
          </label>
        </div>
        <input type="text" placeholder="Stock Symbol" value={stockSymbol} onChange={(e) => setStockSymbol(e.target.value)} required />
        <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required step="0.01" />
        <button type="submit">Submit Trade</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

export default Trade