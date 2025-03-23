import { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AuthContext } from './context/AuthContext'
import { API_URL } from './config'
import { toast } from 'react-toastify'

function PortfolioChart() {
  const { user } = useContext(AuthContext)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token')
        const trades = await axios.get(`${API_URL}/trades`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // Process trades to calculate portfolio value over time
        const portfolio = {}
        
        // Sort trades by date
        const sortedTrades = [...trades.data].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let runningValue = 0;
        sortedTrades.forEach(trade => {
          const date = new Date(trade.date).toLocaleDateString('en-IN');
          runningValue += trade.type === 'buy' 
            ? -trade.quantity * trade.price  // Buy decreases cash
            : trade.quantity * trade.price;  // Sell increases cash
          
          portfolio[date] = runningValue;
        })
        
        // Create chart data - If no trades, use dummy data
        let chartData = [];
        if (Object.keys(portfolio).length > 0) {
          chartData = Object.keys(portfolio).map(date => ({
            date,
            value: portfolio[date],
          }));
        } else {
          // Dummy data if no trades
          const today = new Date();
          for (let i = 10; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            chartData.push({
              date: date.toLocaleDateString('en-IN'),
              value: 0
            });
          }
        }
        
        setData(chartData)
      } catch (error) {
        toast.error('Failed to load portfolio chart data');
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData()
  }, [user])

  const formatRupee = (value) => {
    return `₹${parseInt(value).toLocaleString('en-IN')}`;
  };

  return (
    <div className="portfolio-chart">
      <h3>Portfolio Value Over Time</h3>
      
      {loading ? (
        <div className="chart-loading">Loading chart data...</div>
      ) : (
        <>
          {data.length > 1 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatRupee} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Portfolio Value']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Portfolio Value" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-chart-data">
              Not enough trading history to display chart. Complete more trades to see your portfolio performance.
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PortfolioChart