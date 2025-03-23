import { useState } from 'react'
import axios from 'axios'
import { API_URL } from './config'
import { toast } from 'react-toastify'
import './StockPrice.css'

function StockPrice() {
  const [symbol, setSymbol] = useState('')
  const [price, setPrice] = useState(null)
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const popularIndianStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank' },
    { symbol: 'INFY', name: 'Infosys' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever' },
    { symbol: 'SBIN', name: 'State Bank of India' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank' },
  ]

  const fetchPrice = async () => {
    if (!symbol.trim()) {
      toast.error('Please enter a stock symbol');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.get(`${API_URL}/stocks/price/${symbol.toUpperCase()}`);
      setPrice(res.data.price);
      setStockData({
        date: res.data.date,
        symbol: symbol.toUpperCase()
      });
      toast.success(`Successfully fetched price for ${symbol.toUpperCase()}`);
    } catch (err) {
      setError('Failed to fetch price. Please check the symbol and try again.');
      toast.error('Failed to fetch price');
      setPrice(null);
      setStockData(null);
    } finally {
      setLoading(false);
    }
  }

  const handleQuickSelect = (selectedSymbol) => {
    setSymbol(selectedSymbol);
    // Optionally fetch the price immediately upon selection
  };

  return (
    <div className="stock-price-container">
      <h2>Indian Stock Price Lookup</h2>
      <p className="helper-text">Enter NSE/BSE stock symbol (e.g., RELIANCE, TCS)</p>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Stock Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="stock-input"
        />
        <button onClick={fetchPrice} className="fetch-btn" disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Price'}
        </button>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      {price && stockData && (
        <div className="price-result">
          <h3>{stockData.symbol}</h3>
          <div className="price-value">₹ {parseFloat(price).toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })}</div>
          <div className="price-date">Last updated: {new Date(stockData.date).toLocaleDateString('en-IN')}</div>
        </div>
      )}
      
      <div className="popular-stocks">
        <h3>Popular Indian Stocks</h3>
        <div className="stock-chips">
          {popularIndianStocks.map((stock) => (
            <div 
              key={stock.symbol} 
              className="stock-chip" 
              onClick={() => handleQuickSelect(stock.symbol)}
            >
              {stock.symbol}
              <span className="stock-name">{stock.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="exchange-info">
        <p><strong>NSE:</strong> National Stock Exchange of India</p>
        <p><strong>BSE:</strong> Bombay Stock Exchange</p>
      </div>
    </div>
  )
}

export default StockPrice