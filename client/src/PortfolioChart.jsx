// filepath: /client/src/PortfolioChart.jsx
import { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { AuthContext } from './context/AuthContext'
import { API_URL } from './config'

function PortfolioChart() {
  const { user } = useContext(AuthContext)
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      const trades = await axios.get(`${API_URL}/trades`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Process trades to calculate portfolio value over time
      const portfolio = {}
      trades.data.forEach(trade => {
        const date = new Date(trade.date).toLocaleDateString()
        if (!portfolio[date]) portfolio[date] = 0
        portfolio[date] += trade.type === 'buy' 
          ? trade.quantity * trade.price 
          : -trade.quantity * trade.price
      })
      const chartData = Object.keys(portfolio).map(date => ({
        date,
        value: portfolio[date],
      }))
      setData(chartData)
    }
    if (user) fetchData()
  }, [user])

  return (
    <div>
      <h2>Portfolio Value Over Time</h2>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </div>
  )
}

export default PortfolioChart