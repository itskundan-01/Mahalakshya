import { useState } from 'react'
import axios from 'axios'
import { API_URL } from './config'

function StockPrice() {
  const [symbol, setSymbol] = useState('')
  const [price, setPrice] = useState(null)
  const [error, setError] = useState('')

  const fetchPrice = async () => {
    try {
      const res = await axios.get(`${API_URL}/stocks/price/${symbol}`)
      setPrice(res.data['05. price'])
      setError('')
    } catch (err) {
      setError('Failed to fetch price')
    }
  }

  return (
    <div>
      <h2>Get Real-Time Stock Price</h2>
      <input
        type="text"
        placeholder="Stock Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <button onClick={fetchPrice}>Fetch Price</button>
      {price && <p>Price: ${price}</p>}
      {error && <p>{error}</p>}
    </div>
  )
}

export default StockPrice