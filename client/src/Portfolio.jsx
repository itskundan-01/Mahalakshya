import { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from './context/AuthContext'
import PortfolioChart from './PortfolioChart'
import { API_URL } from './config'
import { toast } from 'react-toastify'
import './Portfolio.css'

function Portfolio() {
  const { user } = useContext(AuthContext)
  const [trades, setTrades] = useState([])
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalInvestment: 0,
    currentValue: 0,
    profit: 0,
    profitPercentage: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTradesAndCalculatePortfolio = async () => {
      if (!user) return;

      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/trades`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTrades(res.data);
        
        // Calculate portfolio summary
        // In a real app, you would fetch current prices for each stock
        // For now, we'll use the trade price as current price
        let totalInvestment = 0;
        let currentValue = 0;
        
        // This is a simplified calculation - in a real app you'd need to track
        // the shares currently owned based on buy/sell history
        res.data.forEach(trade => {
          if (trade.type === 'buy') {
            totalInvestment += trade.quantity * trade.price;
            currentValue += trade.quantity * trade.price * 1.05; // Dummy 5% growth
          } else {
            totalInvestment -= trade.quantity * trade.price;
            currentValue -= trade.quantity * trade.price * 1.05;
          }
        });
        
        const profit = currentValue - totalInvestment;
        const profitPercentage = totalInvestment !== 0 ? (profit / totalInvestment) * 100 : 0;
        
        setPortfolioSummary({
          totalInvestment,
          currentValue,
          profit,
          profitPercentage
        });
        
        toast.success('Portfolio data loaded');
      } catch (error) {
        toast.error('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchTradesAndCalculatePortfolio();
  }, [user]);

  // Group trades by stock symbol
  const groupedTrades = trades.reduce((acc, trade) => {
    const existing = acc.find(item => item.symbol === trade.stockSymbol);
    
    if (existing) {
      if (trade.type === 'buy') {
        existing.quantity += trade.quantity;
        existing.investment += trade.quantity * trade.price;
      } else {
        existing.quantity -= trade.quantity;
        existing.sold += trade.quantity * trade.price;
      }
      existing.trades.push(trade);
    } else {
      acc.push({
        symbol: trade.stockSymbol,
        quantity: trade.type === 'buy' ? trade.quantity : -trade.quantity,
        investment: trade.type === 'buy' ? trade.quantity * trade.price : 0,
        sold: trade.type === 'sell' ? trade.quantity * trade.price : 0,
        trades: [trade]
      });
    }
    
    return acc;
  }, []);

  return (
    <div className="portfolio-container">
      <h2>Your Portfolio</h2>
      
      {loading ? (
        <div className="loading">Loading portfolio data...</div>
      ) : (
        <>
          <div className="portfolio-summary">
            <div className="summary-card">
              <div className="card-label">Total Investment</div>
              <div className="card-value">₹ {portfolioSummary.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
            
            <div className="summary-card">
              <div className="card-label">Current Value</div>
              <div className="card-value">₹ {portfolioSummary.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
            
            <div className={`summary-card ${portfolioSummary.profit >= 0 ? 'positive' : 'negative'}`}>
              <div className="card-label">Profit/Loss</div>
              <div className="card-value">
                {portfolioSummary.profit >= 0 ? '+' : ''}
                ₹ {portfolioSummary.profit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                <span className="percentage">
                  ({portfolioSummary.profitPercentage >= 0 ? '+' : ''}
                  {portfolioSummary.profitPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          
          <div className="portfolio-chart-container">
            <PortfolioChart />
          </div>
          
          <div className="holdings-section">
            <h3>Your Holdings</h3>
            {groupedTrades.length > 0 ? (
              <table className="holdings-table">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Quantity</th>
                    <th>Avg. Buy Price</th>
                    <th>Investment</th>
                    <th>Current Value</th>
                    <th>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedTrades.map((holding) => {
                    // Skip completely sold positions
                    if (holding.quantity <= 0) return null;
                    
                    const avgBuyPrice = holding.investment / holding.quantity;
                    // Simulate current price with 5% growth - in a real app, fetch actual current prices
                    const currentPrice = avgBuyPrice * 1.05;
                    const currentValue = holding.quantity * currentPrice;
                    const pnl = currentValue - holding.investment;
                    const pnlPercentage = (pnl / holding.investment) * 100;
                    
                    return (
                      <tr key={holding.symbol}>
                        <td>{holding.symbol}</td>
                        <td>{holding.quantity}</td>
                        <td>₹ {avgBuyPrice.toFixed(2)}</td>
                        <td>₹ {holding.investment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td>₹ {currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td className={pnl >= 0 ? 'positive' : 'negative'}>
                          {pnl >= 0 ? '+' : ''}
                          ₹ {pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          <span className="percentage">({pnlPercentage.toFixed(2)}%)</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="no-holdings">No holdings found. Start trading to build your portfolio!</p>
            )}
          </div>
          
          <div className="trade-history-section">
            <h3>Recent Transactions</h3>
            {trades.length > 0 ? (
              <table className="trade-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Stock</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 10).map((trade, index) => {
                    const total = trade.quantity * trade.price;
                    return (
                      <tr key={index}>
                        <td>{new Date(trade.date).toLocaleDateString('en-IN')}</td>
                        <td>{trade.stockSymbol}</td>
                        <td className={trade.type === 'buy' ? 'buy-type' : 'sell-type'}>
                          {trade.type.toUpperCase()}
                        </td>
                        <td>{trade.quantity}</td>
                        <td>₹ {trade.price.toFixed(2)}</td>
                        <td>₹ {total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="no-trades">No trade history found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Portfolio