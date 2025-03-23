import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import MarketChart from '../components/MarketChart';
import './StockDetails.css';
// Fix for process is not defined error
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StockDetails = () => {
    const { symbol } = useParams(); // Extract the symbol from URL parameters
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stockData, setStockData] = useState(null);
    const [priceData, setPriceData] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('1d');
    const [priceHistory, setPriceHistory] = useState([]);
    const [relatedStocks, setRelatedStocks] = useState([]);
    const [chartType, setChartType] = useState('line'); // Add chart type state
    
    // Log for debugging
    useEffect(() => {
        console.log("StockDetails rendered with symbol:", symbol);
    }, [symbol]);
    
    useEffect(() => {
        const fetchStockDetails = async () => {
            setLoading(true);
            try {
                // In a production app, this would be a real API call
                // const response = await axios.get(`${API_URL}/stocks/${symbol}`);
                // setStockData(response.data);
                
                // For now, we'll use mock data
                const mockData = getMockStockData(symbol);
                setStockData(mockData);
                
                // Generate price data for the chart with proper OHLC format
                const chartData = generateMockPriceData(timeRange);
                setPriceData(chartData);
                
                // Generate price history data
                setPriceHistory(generatePriceHistoryData());
                
                // Generate related stocks
                setRelatedStocks(getRelatedStocks(mockData.sector));
                
            } catch (error) {
                toast.error('Failed to fetch stock details');
                console.error('Error fetching stock details:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStockDetails();
    }, [symbol, timeRange]);
    
    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        setPriceData(generateMockPriceData(range));
    };
    
    // Generate price history data (last 10 days)
    const generatePriceHistoryData = () => {
        const history = [];
        const currentDate = new Date();
        
        for (let i = 10; i >= 0; i--) {
            const date = new Date();
            date.setDate(currentDate.getDate() - i);
            
            const open = Math.round((1000 + Math.random() * 100) * 100) / 100;
            const close = Math.round((open + (Math.random() - 0.5) * 50) * 100) / 100;
            const high = Math.round((Math.max(open, close) + Math.random() * 20) * 100) / 100;
            const low = Math.round((Math.min(open, close) - Math.random() * 20) * 100) / 100;
            const volume = Math.floor(100000 + Math.random() * 900000);
            
            history.push({
                date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                open,
                high,
                low,
                close,
                volume
            });
        }
        
        return history;
    };
    
    // Get related stocks based on sector
    const getRelatedStocks = (sector) => {
        const sectorStocks = {
            'Oil & Gas': [
                { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation', price: 182.45, change: 2.34, percentChange: 1.3 },
                { symbol: 'IOC', name: 'Indian Oil Corporation', price: 92.75, change: -1.25, percentChange: -1.33 },
                { symbol: 'GAIL', name: 'GAIL India Ltd', price: 128.65, change: 1.85, percentChange: 1.46 },
                { symbol: 'BPCL', name: 'Bharat Petroleum Corporation', price: 357.80, change: 5.40, percentChange: 1.53 }
            ],
            'Technology': [
                { symbol: 'INFY', name: 'Infosys Ltd', price: 1485.60, change: -23.40, percentChange: -1.55 },
                { symbol: 'WIPRO', name: 'Wipro Ltd', price: 442.25, change: -3.75, percentChange: -0.84 },
                { symbol: 'TECHM', name: 'Tech Mahindra Ltd', price: 1125.30, change: 15.45, percentChange: 1.39 },
                { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1080.50, change: 10.25, percentChange: 0.96 }
            ],
            'Financial Services': [
                { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 945.15, change: 8.30, percentChange: 0.89 },
                { symbol: 'SBIN', name: 'State Bank of India', price: 624.80, change: 7.45, percentChange: 1.21 },
                { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 7254.30, change: -85.65, percentChange: -1.17 },
                { symbol: 'AXISBANK', name: 'Axis Bank Ltd', price: 884.55, change: 12.35, percentChange: 1.41 }
            ],
            'Miscellaneous': [
                { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2785.45, change: 43.25, percentChange: 1.58 },
                { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3542.80, change: -28.15, percentChange: -0.79 },
                { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1678.25, change: 12.80, percentChange: 0.77 },
                { symbol: 'INFY', name: 'Infosys Ltd', price: 1485.60, change: -23.40, percentChange: -1.55 }
            ]
        };
        
        return sectorStocks[sector] || sectorStocks['Miscellaneous'];
    };
    
    // Mock stock data generator
    const getMockStockData = (stockSymbol) => {
        const stocks = {
            'RELIANCE': {
                symbol: 'RELIANCE',
                name: 'Reliance Industries Ltd.',
                exchange: 'NSE',
                sector: 'Oil & Gas',
                industry: 'Integrated Oil & Gas',
                currentPrice: 2785.45,
                change: 43.25,
                percentChange: 1.58,
                open: 2754.10,
                high: 2798.65,
                low: 2751.30,
                close: 2742.20,
                volume: 4125000,
                avgVolume: 3850000,
                marketCap: 1880000000000,
                pe: 22.4,
                eps: 124.35,
                dividend: 6.5,
                dividendYield: 0.23,
                beta: 0.95,
                yearHigh: 2996.20,
                yearLow: 2341.15,
                about: 'Reliance Industries Limited is an Indian multinational conglomerate company headquartered in Mumbai, Maharashtra, India. It operates in diverse sectors including energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles. Reliance owns businesses across India engaged in energy, petrochemicals, textiles, natural resources, retail, and telecommunications.',
                news: [
                    { id: 1, title: 'Reliance announces strategic partnership with global tech firm', date: '2023-10-12' },
                    { id: 2, title: 'Reliance Retail reports 27% YoY growth in Q2 revenue', date: '2023-10-08' },
                    { id: 3, title: 'Jio Platforms launches new cloud services for enterprises', date: '2023-10-03' },
                ],
                recommendations: { buy: 18, hold: 5, sell: 2 }
            },
            'TCS': {
                symbol: 'TCS',
                name: 'Tata Consultancy Services Ltd.',
                exchange: 'NSE',
                sector: 'Technology',
                industry: 'IT Services',
                currentPrice: 3542.80,
                change: -28.15,
                percentChange: -0.79,
                open: 3560.00,
                high: 3574.50,
                low: 3540.25,
                close: 3570.95,
                volume: 1485000,
                avgVolume: 1620000,
                marketCap: 1296000000000,
                pe: 29.8,
                eps: 118.89,
                dividend: 38.0,
                dividendYield: 1.07,
                beta: 0.78,
                yearHigh: 3680.00,
                yearLow: 3105.75,
                about: 'Tata Consultancy Services (TCS) is an Indian multinational information technology services and consulting company headquartered in Mumbai, Maharashtra, India. It is a subsidiary of the Tata Group and operates in 149 locations across 46 countries. TCS is the second largest Indian company by market capitalization.',
                news: [
                    { id: 1, title: 'TCS reports robust growth in North American market', date: '2023-10-14' },
                    { id: 2, title: 'TCS announces new AI and cloud capabilities', date: '2023-10-10' },
                    { id: 3, title: 'TCS partners with leading European bank for digital transformation', date: '2023-10-05' },
                ],
                recommendations: { buy: 15, hold: 8, sell: 3 }
            },
            'HDFCBANK': {
                symbol: 'HDFCBANK',
                name: 'HDFC Bank Ltd.',
                exchange: 'NSE',
                sector: 'Financial Services',
                industry: 'Banking',
                currentPrice: 1678.25,
                change: 12.80,
                percentChange: 0.77,
                open: 1670.50,
                high: 1685.30,
                low: 1668.00,
                close: 1665.45,
                volume: 3520000,
                avgVolume: 3280000,
                marketCap: 1260000000000,
                pe: 22.6,
                eps: 74.26,
                dividend: 15.5,
                dividendYield: 0.92,
                beta: 0.85,
                yearHigh: 1724.30,
                yearLow: 1427.80,
                about: 'HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai, Maharashtra. It has a strong presence in retail banking, wholesale banking, and treasury operations. HDFC Bank is one of the largest banks in India by market capitalization and asset size.',
                news: [
                    { id: 1, title: 'HDFC Bank completes merger with parent HDFC Ltd', date: '2023-10-13' },
                    { id: 2, title: 'HDFC Bank expands rural banking footprint', date: '2023-10-07' },
                    { id: 3, title: 'HDFC Bank introduces new digital banking solutions', date: '2023-10-02' },
                ],
                recommendations: { buy: 20, hold: 3, sell: 1 }
            },
            // Add default placeholder for any other symbols
            'default': {
                symbol: stockSymbol,
                name: `${stockSymbol} Corporation`,
                exchange: 'NSE',
                sector: 'Miscellaneous',
                industry: 'General',
                currentPrice: 1245.60,
                change: 18.75,
                percentChange: 1.53,
                open: 1230.00,
                high: 1252.40,
                low: 1228.50,
                close: 1226.85,
                volume: 985000,
                avgVolume: 875000,
                marketCap: 185000000000,
                pe: 19.8,
                eps: 62.91,
                dividend: 12.0,
                dividendYield: 0.96,
                beta: 1.05,
                yearHigh: 1280.25,
                yearLow: 950.40,
                about: `${stockSymbol} is a leading company in its industry segment, known for innovation and market leadership. The company has shown consistent growth over the years.`,
                news: [
                    { id: 1, title: `${stockSymbol} reports quarterly results above expectations`, date: '2023-10-11' },
                    { id: 2, title: `${stockSymbol} announces expansion into new markets`, date: '2023-10-06' },
                    { id: 3, title: `${stockSymbol} introduces new product line`, date: '2023-10-01' },
                ],
                recommendations: { buy: 12, hold: 7, sell: 3 }
            }
        };
        
        return stocks[stockSymbol] || stocks['default'];
    };
    
    // Generate mock price data
    const generateMockPriceData = (range) => {
        const data = [];
        const baseValue = 1000 + Math.random() * 2000;
        let currentValue = baseValue;
        let currentDate = new Date();
        
        let days;
        switch(range) {
            case '1d': days = 1; break;
            case '1w': days = 7; break;
            case '1m': days = 30; break;
            case '6m': days = 180; break;
            case '1y': days = 365; break;
            case '5y': days = 1825; break;
            case 'max': days = 3650; break;
            default: days = 30; break;
        }
        
        // For '1d', generate hourly data (intraday data)
        if (range === '1d') {
            const marketOpen = new Date();
            marketOpen.setHours(9, 15, 0, 0);
            
            const marketClose = new Date();
            marketClose.setHours(15, 30, 0, 0);
            
            // Generate data at 15-minute intervals
            for (let i = 0; i <= 24; i++) {
                const currentTime = new Date(marketOpen);
                currentTime.setMinutes(marketOpen.getMinutes() + i * 15);
                
                if (currentTime > marketClose) break;
                
                const timeString = currentTime.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const volatility = currentValue * 0.005; // 0.5% volatility
                const open = currentValue;
                const close = open + (Math.random() - 0.5) * volatility * 2;
                const high = Math.max(open, close) + Math.random() * volatility;
                const low = Math.min(open, close) - Math.random() * volatility;
                const volume = Math.floor(50000 + Math.random() * 150000);
                
                // Calculate percentage change from previous close
                const previousClose = i > 0 ? data[i-1].close : open;
                const change = close - previousClose;
                const percentChange = (change / previousClose) * 100;
                
                data.push({
                    date: timeString,
                    open,
                    high,
                    low,
                    close,
                    volume,
                    value: close, // For compatibility
                    change,
                    percentChange
                });
                
                currentValue = close; // Update for next iteration
            }
        } else {
            // For other ranges, generate daily data
            for (let i = days; i >= 0; i--) {
                const date = new Date();
                date.setDate(currentDate.getDate() - i);
                
                const dateString = date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit'
                });
                
                const volatility = currentValue * 0.01; // 1% daily volatility
                const open = currentValue;
                const close = open + (Math.random() - 0.5) * volatility * 2;
                const high = Math.max(open, close) + Math.random() * volatility;
                const low = Math.min(open, close) - Math.random() * volatility;
                
                // Volume as a function of volatility - more volatility = more volume
                const volumeBase = Math.floor(200000 + Math.random() * 800000);
                const volumeVolatilityFactor = Math.abs(close - open) / volatility;
                const volume = Math.floor(volumeBase * (1 + volumeVolatilityFactor));
                
                // Calculate percentage change from previous day
                const previousClose = i < days ? data[data.length-1].close : open;
                const change = close - previousClose;
                const percentChange = (change / previousClose) * 100;
                
                data.push({
                    date: dateString,
                    open,
                    high,
                    low,
                    close,
                    volume,
                    value: close, // For compatibility
                    change,
                    percentChange
                });
                
                currentValue = close; // Update for next iteration
            }
        }
        
        // Now let's add moving averages
        const ma20Data = calculateMovingAverage(data, 20);
        const finalData = calculateMovingAverage(ma20Data, 50);
        
        return finalData;
    };

    // Helper function to calculate moving averages
    const calculateMovingAverage = (data, period) => {
        if (!data || data.length === 0 || !period || period <= 0) return data;
        
        return data.map((item, index) => {
            if (index < period - 1) return { ...item, [`ma${period}`]: null };
            
            let sum = 0;
            for (let i = 0; i < period; i++) {
                sum += data[index - i].close;
            }
            return { ...item, [`ma${period}`]: sum / period };
        });
    };

    // Render chart component with one time selector and chart type options
    const renderStockChart = () => {
        return (
            <div className="chart-container">
                <MarketChart 
                    data={priceData} 
                    symbolName={stockData.name}
                    symbolCode={stockData.symbol}
                    onTimeRangeChange={handleTimeRangeChange}
                    height={450}
                />
            </div>
        );
    };
    
    // Render price history table
    const renderPriceHistoryTable = () => {
        return (
            <div className="price-history">
                <h2>Price History</h2>
                <div className="table-responsive">
                    <table className="price-history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Open</th>
                                <th>High</th>
                                <th>Low</th>
                                <th>Close</th>
                                <th>Volume</th>
                            </tr>
                        </thead>
                        <tbody>
                            {priceHistory.map((day, index) => (
                                <tr key={index}>
                                    <td>{day.date}</td>
                                    <td>₹{day.open.toFixed(2)}</td>
                                    <td>₹{day.high.toFixed(2)}</td>
                                    <td>₹{day.low.toFixed(2)}</td>
                                    <td>₹{day.close.toFixed(2)}</td>
                                    <td>{day.volume.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    
    // Render related stocks section
    const renderRelatedStocks = () => {
        return (
            <div className="related-stocks">
                <h2>Related Stocks</h2>
                <div className="related-stocks-grid">
                    {relatedStocks.map(stock => (
                        <div 
                            className="related-stock-card" 
                            key={stock.symbol}
                            onClick={() => navigate(`/stock/${stock.symbol}`)}
                        >
                            <div className="related-stock-symbol">{stock.symbol}</div>
                            <div className="related-stock-name">{stock.name}</div>
                            <div className="related-stock-price">₹{stock.price.toFixed(2)}</div>
                            <div className={`related-stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.percentChange.toFixed(2)}%)
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    const renderRecommendationChart = () => {
        if (!stockData || !stockData.recommendations) return null;
        const { buy, hold, sell } = stockData.recommendations;
        const total = buy + hold + sell;
        
        return (
            <div className="recommendation-chart">
                <div className="recommendation-bars">
                    <div className="bar-container">
                        <div 
                            className="bar buy" 
                            style={{ width: `${(buy / total) * 100}%` }}
                        >
                            <span className="bar-label">{buy}</span>
                        </div>
                    </div>
                    <div className="bar-container">
                        <div 
                            className="bar hold" 
                            style={{ width: `${(hold / total) * 100}%` }}
                        >
                            <span className="bar-label">{hold}</span>
                        </div>
                    </div>
                    <div className="bar-container">
                        <div 
                            className="bar sell" 
                            style={{ width: `${(sell / total) * 100}%` }}
                        >
                            <span className="bar-label">{sell}</span>
                        </div>
                    </div>
                </div>
                <div className="recommendation-labels">
                    <div className="label">Buy</div>
                    <div className="label">Hold</div>
                    <div className="label">Sell</div>
                </div>
            </div>
        );
    };
    
    const formatIndianNumber = (value) => {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(2)} Cr`;
        } else if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)} L`;
        } else {
            return `₹${value.toLocaleString('en-IN')}`;
        }
    };
    
    if (loading) {
        return (
            <div className="stock-details-container loading">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading stock data...</div>
            </div>
        );
    }
    
    if (!stockData) {
        return (
            <div className="stock-details-container error">
                <div className="error-message">
                    <h2>Stock Not Found</h2>
                    <p>The stock symbol "{symbol}" could not be found. Please check the symbol and try again.</p>
                    <button className="back-button" onClick={() => navigate(-1)}>
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="stock-details-container">
            <div className="breadcrumb">
                <Link to="/dashboard">Dashboard</Link> 
                <span className="breadcrumb-separator">/</span> 
                <Link to="/stock-price">Stocks</Link> 
                <span className="breadcrumb-separator">/</span> 
                <span>{symbol}</span>
            </div>
            
            <div className="stock-header">
                <div className="stock-title">
                    <h1>{stockData.name} ({stockData.symbol})</h1>
                    <div className="stock-exchange">
                        <span className="exchange-badge">{stockData.exchange}</span>
                        <span>{stockData.sector}</span>
                        <span>•</span>
                        <span>{stockData.industry}</span>
                    </div>
                </div>
                <div className="stock-actions">
                    <button 
                        className="trade-button" 
                        onClick={() => navigate(`/trade?symbol=${symbol}`)}
                    >
                        Trade Now
                    </button>
                    <button className="add-watchlist-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Add to Watchlist
                    </button>
                </div>
            </div>
            
            <div className="stock-price-info">
                <div className="current-price">
                    <span className="price-value">₹{stockData.currentPrice.toFixed(2)}</span>
                    <span className={`price-change ${stockData.change >= 0 ? 'positive' : 'negative'}`}>
                        <span className="price-change-icon">{stockData.change >= 0 ? '▲' : '▼'}</span>
                        {Math.abs(stockData.change).toFixed(2)} ({Math.abs(stockData.percentChange).toFixed(2)}%)
                    </span>
                </div>
                <div className="price-details">
                    <div className="detail">
                        <span className="label">Open</span>
                        <span className="value">₹{stockData.open.toFixed(2)}</span>
                    </div>
                    <div className="detail">
                        <span className="label">High</span>
                        <span className="value">₹{stockData.high.toFixed(2)}</span>
                    </div>
                    <div className="detail">
                        <span className="label">Low</span>
                        <span className="value">₹{stockData.low.toFixed(2)}</span>
                    </div>
                    <div className="detail">
                        <span className="label">Prev Close</span>
                        <span className="value">₹{stockData.close.toFixed(2)}</span>
                    </div>
                    <div className="detail">
                        <span className="label">Volume</span>
                        <span className="value">{stockData.volume.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
            
            <div className="stock-chart-section">
                {renderStockChart()}
            </div>
            
            <div className="stock-tabs">
                <button 
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`tab-button ${activeTab === 'fundamentals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fundamentals')}
                >
                    Fundamentals
                </button>
                <button 
                    className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
                    onClick={() => setActiveTab('news')}
                >
                    News
                </button>
                <button 
                    className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analysis')}
                >
                    Analysis
                </button>
                <button 
                    className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Price History
                </button>
            </div>
            
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <div className="about-section">
                            <h2>About {stockData.name}</h2>
                            <p>{stockData.about}</p>
                        </div>
                        <div className="key-stats-section">
                            <h2>Key Statistics</h2>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-label">Market Cap</span>
                                    <span className="stat-value">{formatIndianNumber(stockData.marketCap)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">P/E Ratio</span>
                                    <span className="stat-value">{stockData.pe.toFixed(2)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">EPS (TTM)</span>
                                    <span className="stat-value">₹{stockData.eps.toFixed(2)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Dividend Yield</span>
                                    <span className="stat-value">{stockData.dividendYield.toFixed(2)}%</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">52-Week High</span>
                                    <span className="stat-value">₹{stockData.yearHigh.toFixed(2)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">52-Week Low</span>
                                    <span className="stat-value">₹{stockData.yearLow.toFixed(2)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Beta</span>
                                    <span className="stat-value">{stockData.beta.toFixed(2)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Avg. Volume</span>
                                    <span className="stat-value">{stockData.avgVolume.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                        {renderRelatedStocks()}
                    </div>
                )}
                {activeTab === 'fundamentals' && (
                    <div className="fundamentals-tab">
                        <h2>Financial Highlights</h2>
                        <div className="financials-section">
                            <p>Comprehensive fundamental data is a premium feature. Subscribe to access detailed financial metrics.</p>
                            <button className="upgrade-button">Upgrade to Premium</button>
                        </div>
                    </div>
                )}
                {activeTab === 'news' && (
                    <div className="news-tab">
                        <h2>Latest News</h2>
                        <ul className="news-list">
                            {stockData.news.map(item => (
                                <li key={item.id} className="news-item">
                                    <div className="news-content">
                                        <h3 className="news-title">{item.title}</h3>
                                        <span className="news-date">{item.date}</span>
                                    </div>
                                    <button className="read-more">Read More</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {activeTab === 'analysis' && (
                    <div className="analysis-tab">
                        <div className="analyst-recommendations">
                            <h2>Analyst Recommendations</h2>
                            {renderRecommendationChart()}
                        </div>
                        <div className="technical-indicators">
                            <h2>Technical Indicators</h2>
                            <div className="indicator-summary">
                                {stockData.change >= 0 ? (
                                    <div className="summary-positive">
                                        <span className="indicator-signal">BUY</span>
                                        <p>Technical indicators suggest a positive outlook for {stockData.symbol} in the short term. Moving averages are trending upward and momentum indicators show bullish signals.</p>
                                    </div>
                                ) : (
                                    <div className="summary-negative">
                                        <span className="indicator-signal">SELL</span>
                                        <p>Technical indicators suggest a cautious approach for {stockData.symbol} in the short term. Moving averages are trending downward and momentum indicators show bearish signals.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'history' && (
                    <div className="history-tab">
                        {renderPriceHistoryTable()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockDetails;