import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './SearchBar.css';

// Fix for process is not defined error
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const popularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank' },
    { symbol: 'INFY', name: 'Infosys' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank' },
    { symbol: 'SBIN', name: 'State Bank of India' }
  ];

  useEffect(() => {
    // Focus input when search is opened
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Close search on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    // Handle navigation with keyboard
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        scrollIntoView(selectedIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        scrollIntoView(selectedIndex - 1);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectStock(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex]);

  const scrollIntoView = (index) => {
    if (resultsRef.current && resultsRef.current.children[index]) {
      resultsRef.current.children[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  };

  const searchStocks = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would fetch from your API
      // Here we'll mock it with a 500ms delay and filtering the popular stocks
      setTimeout(() => {
        const filtered = popularStocks.filter(stock => 
          stock.symbol.includes(query.toUpperCase()) || 
          stock.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setLoading(false);
      }, 500);

      // Uncomment for real API integration:
      // const response = await axios.get(`${API_URL}/stocks/search?q=${query}`);
      // setResults(response.data);
    } catch (error) {
      toast.error('Error searching stocks');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query) searchStocks();
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query]);

  const handleSelectStock = (stock) => {
    navigate(`/stock/${stock.symbol}`);
    onClose();
  };

  const handlePopularTagClick = (symbol) => {
    setQuery(symbol);
    searchStocks();
  };

  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search for stocks (e.g., RELIANCE, TCS, INFY)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search-btn" onClick={searchStocks}>
          Search
        </button>
      </div>

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Searching stocks...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="search-results" ref={resultsRef}>
          {results.map((result, index) => (
            <div
              key={result.symbol}
              className={`search-result-item ${selectedIndex === index ? 'active' : ''}`}
              onClick={() => handleSelectStock(result)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="stock-symbol">{result.symbol}</div>
              <div className="stock-name">{result.name}</div>
              <div className="stock-exchange">NSE</div>
            </div>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="no-results">
          <p>No stocks found matching "{query}"</p>
        </div>
      )}

      {!loading && !query && (
        <div className="popular-searches">
          <div className="popular-title">Popular Searches:</div>
          <div className="popular-tags">
            {popularStocks.map(stock => (
              <button
                key={stock.symbol}
                className="popular-tag"
                onClick={() => handlePopularTagClick(stock.symbol)}
              >
                {stock.symbol}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
