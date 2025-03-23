import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthContext } from './context/AuthContext';
import { API_URL } from './config';
import { toast } from 'react-toastify';
import './Dashboard.css';

function Dashboard() {
  const [marketIndices, setMarketIndices] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [marketCap, setMarketCap] = useState('large');
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const { user } = useContext(AuthContext);
  const indicesScrollRef = useRef(null);
  
  // Scroll indices horizontally
  const scrollIndices = (direction) => {
    if (indicesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      indicesScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  useEffect(() => {
    // Fetch market indices (dummy data for now)
    const indicesData = [
      { id: 'nifty50', name: 'NIFTY 50', value: 22350.45, change: 120.35, percentChange: 0.54, 
        high: 22400.20, low: 22250.10, open: 22280.30, prevClose: 22230.10, volume: '125.4M' },
      { id: 'sensex', name: 'SENSEX', value: 73100.20, change: 380.75, percentChange: 0.52,
        high: 73200.50, low: 72950.75, open: 73000.25, prevClose: 72719.45, volume: '85.7M' },
      { id: 'niftyBank', name: 'NIFTY BANK', value: 47250.30, change: 220.45, percentChange: 0.47,
        high: 47320.80, low: 47110.20, open: 47150.60, prevClose: 47029.85, volume: '45.2M' },
      { id: 'midcapNifty', name: 'NIFTY MIDCAP', value: 12875.60, change: 95.30, percentChange: 0.75,
        high: 12900.40, low: 12810.25, open: 12830.15, prevClose: 12780.30, volume: '32.8M' },
      { id: 'niftyIT', name: 'NIFTY IT', value: 34800.75, change: -150.25, percentChange: -0.43,
        high: 34950.20, low: 34750.40, open: 34920.10, prevClose: 34951.00, volume: '18.5M' },
      { id: 'bankex', name: 'BANKEX', value: 51250.80, change: 275.45, percentChange: 0.54,
        high: 51300.25, low: 51125.60, open: 51150.75, prevClose: 50975.35, volume: '28.3M' },
      { id: 'niftyPharma', name: 'NIFTY PHARMA', value: 18450.40, change: -75.30, percentChange: -0.41,
        high: 18525.70, low: 18400.20, open: 18510.45, prevClose: 18525.70, volume: '14.7M' },
      { id: 'niftyAuto', name: 'NIFTY AUTO', value: 21325.60, change: 185.75, percentChange: 0.88,
        high: 21350.25, low: 21240.30, open: 21260.80, prevClose: 21139.85, volume: '22.1M' }
    ];
    
    setMarketIndices(indicesData);
    setSelectedIndex(indicesData[0]); // Select first index by default
    
    // Generate chart data for the selected index
    generateChartData(indicesData[0].id);
    
    // Set market movers based on cap
    fetchMarketMovers('large');
    
    // Fetch market news
    setMarketNews([
      { id: 1, headline: 'RBI Holds Policy Rates Steady for Fourth Consecutive Meeting', time: '2 hours ago' },
      { id: 2, headline: 'IT Sector Faces Pressure as Global Tech Spending Slows', time: '3 hours ago' },
      { id: 3, headline: 'Auto Sales Show Strong Recovery in Q2', time: '5 hours ago' }
    ]);
    
    // Fetch user's recent trades if logged in
    const fetchRecentTrades = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_URL}/trades`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRecentTrades(response.data.slice(0, 5)); // Show last 5 trades
        } catch (error) {
          toast.error('Failed to fetch recent trades');
        }
      }
    };
    
    fetchRecentTrades();
  }, [user]);
  
  // Generate chart data for selected index
  const generateChartData = (indexId) => {
    // In real app, fetch actual time-series data for the index
    const timestamps = ['9:15', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '15:30'];
    
    // Different patterns for different indices
    let baseValue = 0;
    let volatility = 0;
    
    switch(indexId) {
      case 'nifty50':
        baseValue = 22200;
        volatility = 100;
        break;
      case 'sensex':
        baseValue = 72800;
        volatility = 300;
        break;
      case 'niftyBank':
        baseValue = 47100;
        volatility = 150;
        break;
      case 'midcapNifty':
        baseValue = 12800;
        volatility = 80;
        break;
      case 'niftyIT':
        baseValue = 34850;
        volatility = 120;
        break;
      case 'bankex':
        baseValue = 51100;
        volatility = 200;
        break;
      case 'niftyPharma':
        baseValue = 18500;
        volatility = 90;
        break;
      case 'niftyAuto':
        baseValue = 21200;
        volatility = 130;
        break;
      default:
        baseValue = 22200;
        volatility = 100;
    }
    
    const data = timestamps.map((time, index) => {
      // Create some variations in price movement
      const randomMove = Math.random() * volatility * (Math.random() > 0.5 ? 1 : -1);
      const trendMove = index * (Math.random() > 0.3 ? 10 : -5);
      
      return {
        time,
        value: Math.round((baseValue + randomMove + trendMove) * 100) / 100
      };
    });
    
    setChartData(data);
  };
  
  // Fetch market movers based on cap category
  const fetchMarketMovers = (capCategory) => {
    setMarketCap(capCategory);
    
    // Dummy data - in real app, fetch based on category
    const gainersData = {
      large: [
        { symbol: 'TATAMOTORS', price: 875.50, change: 35.25, percentChange: 4.20 },
        { symbol: 'HDFCBANK', price: 1675.30, change: 45.60, percentChange: 2.80 },
        { symbol: 'RELIANCE', price: 2950.75, change: 65.35, percentChange: 2.27 }
      ],
      mid: [
        { symbol: 'FEDERALBNK', price: 152.80, change: 8.75, percentChange: 6.08 },
        { symbol: 'ABCAPITAL', price: 212.40, change: 10.35, percentChange: 5.12 },
        { symbol: 'TATACOMM', price: 1945.25, change: 85.75, percentChange: 4.61 }
      ],
      small: [
        { symbol: 'TEJASNET', price: 112.25, change: 10.75, percentChange: 10.60 },
        { symbol: 'RAILVIKAS', price: 178.50, change: 15.25, percentChange: 9.34 },
        { symbol: 'FIBERWEB', price: 42.75, change: 3.50, percentChange: 8.92 }
      ]
    };
    
    const losersData = {
      large: [
        { symbol: 'INFY', price: 1450.25, change: -45.75, percentChange: -3.06 },
        { symbol: 'TCS', price: 3725.60, change: -85.40, percentChange: -2.24 },
        { symbol: 'WIPRO', price: 475.25, change: -8.50, percentChange: -1.76 }
      ],
      mid: [
        { symbol: 'PEL', price: 842.50, change: -34.75, percentChange: -3.96 },
        { symbol: 'MPHASIS', price: 2350.75, change: -85.25, percentChange: -3.50 },
        { symbol: 'CROMPTON', price: 325.40, change: -10.75, percentChange: -3.20 }
      ],
      small: [
        { symbol: 'OPTOCIRCUI', price: 285.75, change: -28.50, percentChange: -9.07 },
        { symbol: 'MAHASTEEL', price: 24.35, change: -2.15, percentChange: -8.12 },
        { symbol: 'KHAICHEM', price: 112.80, change: -9.45, percentChange: -7.73 }
      ]
    };
    
    setTopGainers(gainersData[capCategory]);
    setTopLosers(losersData[capCategory]);
  };
  
  // Handle index selection
  const handleIndexSelect = (index) => {
    setSelectedIndex(index);
    generateChartData(index.id);
  };

  return (
    <div className="dashboard-container">
      <h2>Market Dashboard</h2>
      
      {/* Market Indices Scrollable Section */}
      <div className="indices-container">
        <button className="scroll-button left" onClick={() => scrollIndices('left')}>
          &lt;
        </button>
        <div className="indices-scroll" ref={indicesScrollRef}>
          {marketIndices.map((index) => (
            <div 
              key={index.id} 
              className={`index-card ${selectedIndex && selectedIndex.id === index.id ? 'selected' : ''}`}
              onClick={() => handleIndexSelect(index)}
            >
              <div className="index-name">{index.name}</div>
              <div className="index-value">{index.value.toLocaleString()}</div>
              <div className={`index-change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                {index.change > 0 ? '+' : ''}{index.change} ({index.percentChange}%)
              </div>
            </div>
          ))}
        </div>
        <button className="scroll-button right" onClick={() => scrollIndices('right')}>
          &gt;
        </button>
      </div>
      
      {/* Chart and Details Section */}
      <div className="chart-details-container">
        <div className="market-chart">
          <h3>{selectedIndex ? selectedIndex.name : 'Market'} Movement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={['dataMin - 100', 'dataMax + 100']} />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={selectedIndex ? selectedIndex.name : 'Price'} 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {selectedIndex && (
          <div className="index-details">
            <h3>{selectedIndex.name} Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Open</span>
                <span className="detail-value">{selectedIndex.open.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">High</span>
                <span className="detail-value">{selectedIndex.high.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Low</span>
                <span className="detail-value">{selectedIndex.low.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Prev Close</span>
                <span className="detail-value">{selectedIndex.prevClose.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Change</span>
                <span className={`detail-value ${selectedIndex.change >= 0 ? 'positive' : 'negative'}`}>
                  {selectedIndex.change > 0 ? '+' : ''}{selectedIndex.change} ({selectedIndex.percentChange}%)
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Volume</span>
                <span className="detail-value">{selectedIndex.volume}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Market Movers Section with Categories */}
      <div className="market-movers-container">
        <div className="movers-header">
          <h3>Market Movers</h3>
          <div className="cap-filters">
            <button 
              className={`cap-btn ${marketCap === 'large' ? 'active' : ''}`}
              onClick={() => fetchMarketMovers('large')}
            >
              Large Cap
            </button>
            <button 
              className={`cap-btn ${marketCap === 'mid' ? 'active' : ''}`}
              onClick={() => fetchMarketMovers('mid')}
            >
              Mid Cap
            </button>
            <button 
              className={`cap-btn ${marketCap === 'small' ? 'active' : ''}`}
              onClick={() => fetchMarketMovers('small')}
            >
              Small Cap
            </button>
          </div>
        </div>
        
        <div className="movers-grid">
          <div className="market-movers">
            <h4>Top Gainers</h4>
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Price (₹)</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {topGainers.map((stock) => (
                  <tr key={stock.symbol}>
                    <td>{stock.symbol}</td>
                    <td>{stock.price.toFixed(2)}</td>
                    <td className="positive">+{stock.change} ({stock.percentChange}%)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="market-movers">
            <h4>Top Losers</h4>
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Price (₹)</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {topLosers.map((stock) => (
                  <tr key={stock.symbol}>
                    <td>{stock.symbol}</td>
                    <td>{stock.price.toFixed(2)}</td>
                    <td className="negative">{stock.change} ({stock.percentChange}%)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Bottom Sections: News and Recent Trades */}
      <div className="bottom-sections">
        <div className="market-news card">
          <h3>Market News</h3>
          <ul className="news-list">
            {marketNews.map((news) => (
              <li key={news.id}>
                <span className="news-headline">{news.headline}</span>
                <span className="news-time">{news.time}</span>
              </li>
            ))}
          </ul>
          <Link to="/market-news" className="view-more">View More News</Link>
        </div>
        
        <div className="recent-trades card">
          <h3>Your Recent Trades</h3>
          {recentTrades.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, index) => (
                  <tr key={index}>
                    <td>{trade.stockSymbol}</td>
                    <td className={trade.type === 'buy' ? 'positive' : 'negative'}>
                      {trade.type.toUpperCase()}
                    </td>
                    <td>{trade.quantity}</td>
                    <td>{trade.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent trades. <Link to="/trade">Start Trading</Link></p>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/trade" className="action-btn trade-btn">Trade Now</Link>
        <Link to="/portfolio" className="action-btn portfolio-btn">View Portfolio</Link>
        <Link to="/stock-price" className="action-btn price-btn">Stock Lookup</Link>
      </div>
    </div>
  );
}

export default Dashboard;