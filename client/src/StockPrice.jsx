import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './config';
import { toast } from 'react-toastify';
import './StockPrice.css';

function Stocks() {
  const navigate = useNavigate();
  const [searchSymbol, setSearchSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('popular');
  const [activeSector, setActiveSector] = useState('all');
  const [stocksList, setStocksList] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Stock categories
  const categories = [
    { id: 'popular', name: 'Popular Stocks' },
    { id: 'gainers', name: 'Top Gainers' },
    { id: 'losers', name: 'Top Losers' },
    { id: 'volume', name: 'Most Traded' },
    { id: 'sectors', name: 'Sectors' }
  ];
  
  // Sectors for filtering
  const sectors = [
    { id: 'all', name: 'All Sectors' },
    { id: 'finance', name: 'Financial Services' },
    { id: 'technology', name: 'Technology' },
    { id: 'energy', name: 'Oil & Gas' },
    { id: 'consumer', name: 'Consumer Goods' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'manufacturing', name: 'Manufacturing' },
    { id: 'realestate', name: 'Real Estate' }
  ];

  // Mock data - Popular stocks
  const popularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2785.45, change: 43.25, percentChange: 1.58, sector: 'energy' },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', price: 3542.80, change: -28.15, percentChange: -0.79, sector: 'technology' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1678.25, change: 12.80, percentChange: 0.77, sector: 'finance' },
    { symbol: 'INFY', name: 'Infosys Ltd', price: 1485.60, change: -23.40, percentChange: -1.55, sector: 'technology' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 945.15, change: 8.30, percentChange: 0.89, sector: 'finance' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', price: 2245.30, change: 15.75, percentChange: 0.71, sector: 'consumer' },
    { symbol: 'SBIN', name: 'State Bank of India', price: 624.80, change: 7.45, percentChange: 1.21, sector: 'finance' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', price: 7254.30, change: -85.65, percentChange: -1.17, sector: 'finance' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1032.55, change: 18.70, percentChange: 1.85, sector: 'technology' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', price: 1754.20, change: -12.35, percentChange: -0.70, sector: 'finance' },
    { symbol: 'WIPRO', name: 'Wipro Ltd', price: 442.25, change: -3.75, percentChange: -0.84, sector: 'technology' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd', price: 884.55, change: 12.35, percentChange: 1.41, sector: 'finance' }
  ];

  // Mock data - Top Gainers
  const topGainers = [
    { symbol: 'NTPC', name: 'NTPC Ltd', price: 298.75, change: 14.25, percentChange: 5.01, sector: 'energy' },
    { symbol: 'COALINDIA', name: 'Coal India Ltd', price: 358.55, change: 15.75, percentChange: 4.59, sector: 'energy' },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', price: 4275.80, change: 168.45, percentChange: 4.10, sector: 'manufacturing' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', price: 1485.30, change: 55.20, percentChange: 3.86, sector: 'healthcare' },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', price: 158.75, change: 5.85, percentChange: 3.83, sector: 'manufacturing' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1032.55, change: 18.70, percentChange: 1.85, sector: 'technology' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 945.60, change: 15.80, percentChange: 1.70, sector: 'manufacturing' },
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2785.45, change: 43.25, percentChange: 1.58, sector: 'energy' }
  ];

  // Mock data - Top Losers
  const topLosers = [
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', price: 7254.30, change: -85.65, percentChange: -1.17, sector: 'finance' },
    { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd', price: 624.85, change: -18.40, percentChange: -2.86, sector: 'finance' },
    { symbol: 'TECHM', name: 'Tech Mahindra Ltd', price: 1245.70, change: -35.65, percentChange: -2.78, sector: 'technology' },
    { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', price: 4878.35, change: -128.95, percentChange: -2.58, sector: 'consumer' },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', price: 3542.80, change: -28.15, percentChange: -0.79, sector: 'technology' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', price: 1754.20, change: -12.35, percentChange: -0.70, sector: 'finance' },
    { symbol: 'INFY', name: 'Infosys Ltd', price: 1485.60, change: -23.40, percentChange: -1.55, sector: 'technology' },
    { symbol: 'WIPRO', name: 'Wipro Ltd', price: 442.25, change: -3.75, percentChange: -0.84, sector: 'technology' }
  ];

  // Mock data - Most Traded (by volume)
  const mostTraded = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2785.45, change: 43.25, percentChange: 1.58, volume: 4125000, sector: 'energy' },
    { symbol: 'SBIN', name: 'State Bank of India', price: 624.80, change: 7.45, percentChange: 1.21, volume: 3950000, sector: 'finance' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1678.25, change: 12.80, percentChange: 0.77, volume: 3520000, sector: 'finance' },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', price: 158.75, change: 5.85, percentChange: 3.83, volume: 3480000, sector: 'manufacturing' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 945.15, change: 8.30, percentChange: 0.89, volume: 3310000, sector: 'finance' },
    { symbol: 'NTPC', name: 'NTPC Ltd', price: 298.75, change: 14.25, percentChange: 5.01, volume: 3175000, sector: 'energy' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 945.60, change: 15.80, percentChange: 1.70, volume: 2980000, sector: 'manufacturing' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1032.55, change: 18.70, percentChange: 1.85, volume: 2650000, sector: 'technology' }
  ];

  useEffect(() => {
    // On initial load, set the stocks list to popular stocks
    handleCategoryChange('popular');
  }, []);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSector('all'); // Reset sector filter when changing category
    
    // Based on the category, set the appropriate stock list
    switch (categoryId) {
      case 'popular':
        setStocksList(popularStocks);
        break;
      case 'gainers':
        setStocksList(topGainers);
        break;
      case 'losers':
        setStocksList(topLosers);
        break;
      case 'volume':
        setStocksList(mostTraded);
        break;
      case 'sectors':
        // When sectors is selected, show all stocks but enable sector filtering
        setStocksList(popularStocks.concat(topGainers, topLosers, mostTraded)
          .filter((stock, index, self) => 
            // Remove duplicates based on symbol
            index === self.findIndex(s => s.symbol === stock.symbol)
          )
        );
        break;
      default:
        setStocksList(popularStocks);
    }
  };

  const handleSectorChange = (sectorId) => {
    setActiveSector(sectorId);
    
    // If all sectors is selected, reset filtering
    if (sectorId === 'all') {
      handleCategoryChange(activeCategory);
      return;
    }
    
    // Otherwise, filter the stocks by the selected sector
    let baseStocks = [];
    switch (activeCategory) {
      case 'popular':
        baseStocks = popularStocks;
        break;
      case 'gainers':
        baseStocks = topGainers;
        break;
      case 'losers':
        baseStocks = topLosers;
        break;
      case 'volume':
        baseStocks = mostTraded;
        break;
      case 'sectors':
        // When sectors is the active category, filter all combined stocks
        baseStocks = popularStocks.concat(topGainers, topLosers, mostTraded)
          .filter((stock, index, self) => 
            index === self.findIndex(s => s.symbol === stock.symbol)
          );
        break;
      default:
        baseStocks = popularStocks;
    }
    
    // Filter the base stocks by sector
    setStocksList(baseStocks.filter(stock => stock.sector === sectorId));
  };

  const handleStockSelect = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  const handleSearch = async () => {
    if (!searchSymbol.trim()) {
      toast.error('Please enter a stock symbol');
      return;
    }
    
    setLoading(true);
    setError('');
    setLoadingProgress(0);
    
    // Start progress animation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const increment = prev < 50 ? 10 : prev < 80 ? 5 : 2;
        return Math.min(prev + increment, 90);
      });
    }, 300);
    
    try {
      // Use the optimized price-only endpoint
      const response = await axios.get(`${API_URL}/stocks/priceonly/${searchSymbol.toUpperCase()}`, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      setLoadingProgress(100);
      
      if (response.data && response.data.symbol) {
        // Navigate to the stock details page
        navigate(`/stock/${response.data.symbol}`);
        toast.success(`Redirecting to ${response.data.name || response.data.symbol} details`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setLoadingProgress(0);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again later.');
        toast.error('Request timed out');
      } else if (err.response) {
        const statusCode = err.response.status;
        if (statusCode === 404) {
          setError(`Stock symbol '${searchSymbol}' not found. Please check the symbol and try again.`);
        } else {
          setError(`Error: ${err.response.data?.error || 'Failed to fetch stock information'}`);
        }
        toast.error('Failed to find stock');
      } else {
        setError(`Error searching for stock: ${err.message}`);
        toast.error('Search failed');
      }
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  // Function to group stocks by sector for better visualization
  const groupStocksBySector = () => {
    if (activeSector !== 'all') {
      // If a sector is selected, we don't need to group
      return { [activeSector]: stocksList };
    }
    
    // Group stocks by sector
    return stocksList.reduce((groups, stock) => {
      const sector = stock.sector;
      if (!groups[sector]) {
        groups[sector] = [];
      }
      groups[sector].push(stock);
      return groups;
    }, {});
  };

  // Get sector name from id
  const getSectorName = (sectorId) => {
    const sector = sectors.find(s => s.id === sectorId);
    return sector ? sector.name : 'Other';
  };

  // Render stock cards in a grid layout
  const renderStockCards = () => {
    if (stocksList.length === 0) {
      return (
        <div className="no-stocks-message">
          <p>No stocks found matching the selected criteria.</p>
          <button 
            className="reset-filter-button"
            onClick={() => handleCategoryChange('popular')}
          >
            View Popular Stocks
          </button>
        </div>
      );
    }

    if (activeCategory === 'sectors' && activeSector === 'all') {
      // Group by sectors and display in sections
      const groupedStocks = groupStocksBySector();
      
      return (
        <div className="sectors-grid">
          {Object.keys(groupedStocks).map(sectorId => (
            <div key={sectorId} className="sector-section">
              <h3 className="sector-title">
                {getSectorName(sectorId)}
                <span className="sector-count">{groupedStocks[sectorId].length} stocks</span>
              </h3>
              <div className="sector-description">
                {getSectorDescription(sectorId)}
              </div>
              <div className="stock-cards-grid">
                {groupedStocks[sectorId].map(stock => renderStockCard(stock))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Display in a grid with category header
    return (
      <div className="category-section">
        <div className="category-header">
          <h2 className="category-title">
            {categories.find(cat => cat.id === activeCategory)?.name || ''}
            {activeSector !== 'all' && (
              <span className="category-filter">
                - {getSectorName(activeSector)}
              </span>
            )}
          </h2>
          <div className="category-stats">
            <span className="stats-item">
              <span className="stats-label">Total:</span> 
              <span className="stats-value">{stocksList.length} stocks</span>
            </span>
            {activeCategory === 'volume' && (
              <span className="stats-item">
                <span className="stats-label">Highest Volume:</span>
                <span className="stats-value">
                  {stocksList.length > 0 ? 
                    `${stocksList[0].symbol} (${stocksList[0].volume?.toLocaleString('en-IN') || 'N/A'})`
                    : 'N/A'
                  }
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="stock-cards-grid">
          {stocksList.map(stock => renderStockCard(stock))}
        </div>
      </div>
    );
  };

  // Add sector descriptions
  const getSectorDescription = (sectorId) => {
    const descriptions = {
      'finance': 'Banking, insurance, and financial service providers.',
      'technology': 'Information technology, software, and tech service companies.',
      'energy': 'Oil, gas, electricity, and renewable energy companies.',
      'consumer': 'Companies producing everyday consumer products and services.',
      'healthcare': 'Pharmaceutical, healthcare services, and medical equipment providers.',
      'manufacturing': 'Companies involved in the production of industrial goods.',
      'realestate': 'Real estate development, management, and investment companies.'
    };
    
    return descriptions[sectorId] || '';
  };

  // Render individual stock card with enhanced design
  const renderStockCard = (stock) => (
    <div 
      key={stock.symbol} 
      className="stock-card" 
      onClick={() => handleStockSelect(stock.symbol)}
    >
      <div className="stock-card-header">
        <span className="stock-symbol-badge">{stock.symbol}</span>
        <span className={`stock-percent-pill ${stock.percentChange >= 0 ? 'positive' : 'negative'}`}>
          {stock.percentChange >= 0 ? '↑' : '↓'} {Math.abs(stock.percentChange).toFixed(2)}%
        </span>
      </div>
      
      <h3 className="stock-card-name">{stock.name}</h3>
      
      <div className="stock-card-price">
        <span className="price-value">₹{stock.price.toFixed(2)}</span>
        <span className={`price-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
        </span>
      </div>
      
      {activeCategory === 'volume' && stock.volume && (
        <div className="stock-card-volume">
          <span className="volume-label">Volume:</span>
          <span className="volume-value">{stock.volume.toLocaleString('en-IN')}</span>
        </div>
      )}
      
      <div className="stock-card-info">
        <div className="stock-card-sector">
          <span className="sector-tag">{getSectorName(stock.sector)}</span>
        </div>
        
        <div className="stock-performance-indicator">
          <div className="performance-bar-container">
            <div 
              className={`performance-bar ${stock.percentChange >= 0 ? 'positive' : 'negative'}`}
              style={{ 
                width: `${Math.min(Math.abs(stock.percentChange) * 10, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
      
      <button 
        className="view-details-button"
        onClick={(e) => {
          e.stopPropagation();
          handleStockSelect(stock.symbol);
        }}
      >
        View Details
      </button>
    </div>
  );

  return (
    <div className="stocks-page">
      <div className="stocks-content">
        <div className="stocks-header">
          <h1 className="stocks-title">Stocks Dashboard</h1>
          <p className="stocks-description">
            Discover and analyze stocks across different sectors of the Indian market
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="stocks-search-container">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Enter stock symbol or company name..."
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
              className="stock-symbol-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button 
              onClick={handleSearch} 
              className="stock-search-button" 
              disabled={loading}
            >
              {loading ? (
                <span className="loading-text">
                  <span className="spinner"></span>
                  <span>Searching...</span>
                </span>
              ) : (
                'Search'
              )}
            </button>
          </div>
          
          {loading && loadingProgress > 0 && (
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          )}
          
          {error && <div className="stock-error-message">{error}</div>}
        </div>

        {/* Categories Navigation */}
        <div className="stocks-categories">
          <div className="categories-nav">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {getCategoryIcon(category.id)}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
          
          {/* Show sectors filter only when sectors category is selected or when filtering by sector */}
          {(activeCategory === 'sectors' || activeSector !== 'all') && (
            <div className="sector-filter">
              <h3 className="filter-title">Filter by Sector</h3>
              <div className="sector-chips">
                {sectors.map(sector => (
                  <button
                    key={sector.id}
                    className={`sector-chip ${activeSector === sector.id ? 'active' : ''}`}
                    onClick={() => handleSectorChange(sector.id)}
                  >
                    {sector.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Render stock cards instead of a table */}
        <div className="stocks-display-container">
          {renderStockCards()}
        </div>
        
        <div className="stocks-info-box">
          <h3 className="info-box-title">Market Information</h3>
          <div className="info-box-content">
            <p><strong>NSE:</strong> National Stock Exchange of India</p>
            <p><strong>BSE:</strong> Bombay Stock Exchange</p>
            <p className="disclaimer">Stock data is delayed by at least 15 minutes and is for informational purposes only.</p>
            <p>Click on any stock card to see detailed information and performance metrics.</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Helper function to get category icons
  function getCategoryIcon(categoryId) {
    switch(categoryId) {
      case 'popular': return <span className="category-icon">🔥</span>;
      case 'gainers': return <span className="category-icon">📈</span>;
      case 'losers': return <span className="category-icon">📉</span>;
      case 'volume': return <span className="category-icon">📊</span>;
      case 'sectors': return <span className="category-icon">🏢</span>;
      default: return null;
    }
  }
}

export default Stocks;