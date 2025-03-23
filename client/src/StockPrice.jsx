import { useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import { toast } from 'react-toastify';
import './StockPrice.css';

function StockPrice() {
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
  ];

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
  };

  const handleQuickSelect = (selectedSymbol) => {
    setSymbol(selectedSymbol);
    // Fetch the price immediately upon selection
    setTimeout(() => {
      fetchPrice();
    }, 100);
  };

  return (
    <div className="stock-price-page">
      <div className="stock-price-wrapper">
        <div className="stock-price-header">
          <h2>Indian Stock Price Lookup</h2>
          <p className="helper-text">Enter NSE/BSE stock symbol to get the latest price information</p>
        </div>
        
        <div className="stock-search-container">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Stock Symbol (e.g., RELIANCE, TCS)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="stock-symbol-input"
            />
            <button 
              onClick={fetchPrice} 
              className="stock-fetch-button" 
              disabled={loading}
            >
              {loading ? (
                <span className="loading-text">
                  <span className="spinner"></span>
                  <span>Loading...</span>
                </span>
              ) : (
                'Fetch Price'
              )}
            </button>
          </div>
          
          {error && <div className="stock-error-message">{error}</div>}
        </div>
        
        {price && stockData && (
          <div className="price-result-card">
            <h3 className="stock-symbol-heading">{stockData.symbol}</h3>
            <div className="price-value">₹ {parseFloat(price).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2
            })}</div>
            <div className="price-date">Last updated: {new Date(stockData.date).toLocaleDateString('en-IN')}</div>
          </div>
        )}

        <div className="popular-stocks-section">
          <h3 className="section-heading">Popular Indian Stocks</h3>
          <div className="stock-chips-container">
            {popularIndianStocks.map((stock) => (
              <div 
                key={stock.symbol} 
                className="stock-chip" 
                onClick={() => handleQuickSelect(stock.symbol)}
              >
                {stock.symbol}
                <span className="stock-tooltip">{stock.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        
        
        <div className="exchange-info-box">
          <p><strong>NSE:</strong> National Stock Exchange of India</p>
          <p><strong>BSE:</strong> Bombay Stock Exchange</p>
          <p>Stock prices are delayed by at least 15 minutes and are for informational purposes only.</p>
        </div>
      </div>
    </div>
  );
}

export default StockPrice;