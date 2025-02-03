import { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from './context/AuthContext'
import PortfolioChart from './PortfolioChart'
import { API_URL } from './config'

function Portfolio() {
  const { user } = useContext(AuthContext)
  const [trades, setTrades] = useState([])

  useEffect(() => {
    const fetchTrades = async () => {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/trades`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTrades(res.data)
    }
    if (user) fetchTrades()
  }, [user])

  return (
    <div>
      <h2>Your Trades</h2>
      <ul>
        {trades.map(trade => (
          <li key={trade._id}>
            {trade.type} {trade.quantity} shares of {trade.stockSymbol} at ${trade.price} on {new Date(trade.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
      <PortfolioChart />
    </div>
  )
}

export default Portfolio