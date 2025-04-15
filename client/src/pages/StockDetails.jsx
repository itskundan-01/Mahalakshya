import React, { useState, useEffect, useRef } from 'react';
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
    const [industryAverage, setIndustryAverage] = useState(null);
    const [chartType, setChartType] = useState('line');
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const [showTooltip, setShowTooltip] = useState(null);
    const [technicalScore, setTechnicalScore] = useState(0);
    const [technicalSignals, setTechnicalSignals] = useState({
        macd: { signal: 'neutral', strength: 0 },
        rsi: { signal: 'neutral', strength: 0 },
        ma: { signal: 'neutral', strength: 0 },
        ema: { signal: 'neutral', strength: 0 }
    });
    // New state variables for education panel
    const [showEducationPanel, setShowEducationPanel] = useState(false);
    const [activeEducationTopic, setActiveEducationTopic] = useState('basics');
    
    // Refs for scrolling to sections
    const overviewRef = useRef(null);
    
    // Log for debugging
    useEffect(() => {
        console.log("StockDetails rendered with symbol:", symbol);
    }, [symbol]);
    
    useEffect(() => {
        const fetchStockDetails = async () => {
            setLoading(true);
            try {
                // Make a real API call using the new Indian Stock Market API
                const response = await axios.get(`${API_URL}/stocks/price/${symbol}`);
                
                if (response.data && response.data.data) {
                    // Use the real data from the API
                    const apiData = response.data.data;
                    const stockInfo = {
                        symbol: apiData.id || symbol,
                        name: apiData.commonName || `${symbol} Corporation`,
                        exchange: apiData.exchangeCodeNsi ? 'NSE' : 'BSE',
                        sector: apiData.mgSector || 'Miscellaneous',
                        industry: apiData.mgIndustry || 'General',
                        currentPrice: parseFloat(response.data.price) || 0,
                        change: 0, // We'll calculate this
                        percentChange: 0, // We'll calculate this
                        // Use fallback values for fields that might not exist in the API
                        open: apiData.currentPrice?.open || parseFloat(response.data.price),
                        high: apiData.currentPrice?.high || parseFloat(response.data.price) * 1.01,
                        low: apiData.currentPrice?.low || parseFloat(response.data.price) * 0.99,
                        close: apiData.currentPrice?.previousClose || parseFloat(response.data.price),
                        volume: apiData.currentPrice?.volume || 1000000,
                        avgVolume: apiData.currentPrice?.averageVolume || 1000000,
                        marketCap: apiData.companyProfile?.marketCap || 1000000000,
                        pe: apiData.keyMetrics?.pe || 15,
                        eps: apiData.keyMetrics?.eps || parseFloat(response.data.price) / 20,
                        dividend: apiData.financials?.dividend || 0,
                        dividendYield: apiData.keyMetrics?.dividendYield || 0,
                        beta: apiData.keyMetrics?.beta || 1.0,
                        yearHigh: apiData.yearHigh || parseFloat(response.data.price) * 1.2,
                        yearLow: apiData.yearLow || parseFloat(response.data.price) * 0.8,
                        about: apiData.companyProfile?.description || `${apiData.commonName || symbol} is a company listed on the Indian stock exchange.`,
                        news: [ // Default news as API might not provide this
                            { id: 1, title: `${apiData.commonName || symbol} latest financial results`, date: new Date().toISOString().split('T')[0] },
                            { id: 2, title: `${apiData.commonName || symbol} market analysis`, date: new Date(Date.now() - 86400000).toISOString().split('T')[0] }
                        ],
                        recommendations: { 
                            buy: apiData.analystView?.buyCount || 10, 
                            hold: apiData.analystView?.holdCount || 5, 
                            sell: apiData.analystView?.sellCount || 2 
                        },
                        trends: apiData.activeStockTrends || null,
                        // Enhanced fields for better user information
                        debtToEquity: apiData.keyMetrics?.debtToEquity || 0.75,
                        profitMargin: apiData.keyMetrics?.profitMargin || 15.8,
                        returnOnEquity: apiData.keyMetrics?.roe || 18.7,
                        freeCashFlow: apiData.keyMetrics?.freeCashFlow || 125000000000,
                        priceToBook: apiData.keyMetrics?.priceToBook || 3.5,
                        revenue: apiData.financials?.revenue || 650000000000,
                        revenueGrowth: apiData.financials?.revenueGrowth || 12.4,
                    };
                    
                    // Calculate change and percent change if possible
                    if (stockInfo.currentPrice && stockInfo.close) {
                        stockInfo.change = stockInfo.currentPrice - stockInfo.close;
                        stockInfo.percentChange = (stockInfo.change / stockInfo.close) * 100;
                    }
                    
                    setStockData(stockInfo);
                    
                    // Generate price data for the chart with proper OHLC format
                    const chartData = generateMockPriceData(timeRange);
                    setPriceData(chartData);
                    
                    // Generate price history data
                    setPriceHistory(generatePriceHistoryData());
                    
                    // Get related stocks
                    try {
                        const relatedData = await fetchRelatedStocks(stockInfo.sector);
                        setRelatedStocks(relatedData);
                        // Calculate industry averages
                        calculateIndustryAverages(stockInfo, relatedData);
                    } catch (error) {
                        console.error('Error fetching related stocks:', error);
                        const mockRelated = getRelatedStocks(stockInfo.sector);
                        setRelatedStocks(mockRelated);
                        calculateIndustryAverages(stockInfo, mockRelated);
                    }
                } else {
                    // Fallback to mock data if API doesn't return expected format
                    const mockData = getMockStockData(symbol);
                    setStockData(mockData);
                    
                    const chartData = generateMockPriceData(timeRange);
                    setPriceData(chartData);
                    
                    setPriceHistory(generatePriceHistoryData());
                    const mockRelated = getRelatedStocks(mockData.sector);
                    setRelatedStocks(mockRelated);
                    calculateIndustryAverages(mockData, mockRelated);
                    
                    console.warn('API did not return expected data format, using mock data');
                }
            } catch (error) {
                toast.error('Failed to fetch stock details');
                console.error('Error fetching stock details:', error);
                
                // Fallback to mock data on error
                const mockData = getMockStockData(symbol);
                setStockData(mockData);
                
                const chartData = generateMockPriceData(timeRange);
                setPriceData(chartData);
                
                setPriceHistory(generatePriceHistoryData());
                const mockRelated = getRelatedStocks(mockData.sector);
                setRelatedStocks(mockRelated);
                calculateIndustryAverages(mockData, mockRelated);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStockDetails();
    }, [symbol, timeRange]);
    
    // Calculate industry averages from related stocks
    const calculateIndustryAverages = (stockInfo, relatedStocks) => {
        if (!relatedStocks || relatedStocks.length === 0) return;
        
        // Include current stock in calculations
        const allStocks = [...relatedStocks, {
            pe: stockInfo.pe,
            percentChange: stockInfo.percentChange,
            priceToBook: stockInfo.priceToBook,
            profitMargin: stockInfo.profitMargin,
            returnOnEquity: stockInfo.returnOnEquity
        }];
        
        const peValues = allStocks.map(stock => stock.pe).filter(Boolean);
        const priceToBookValues = allStocks.map(stock => stock.priceToBook).filter(Boolean);
        const profitMarginValues = allStocks.map(stock => stock.profitMargin).filter(Boolean);
        const roeValues = allStocks.map(stock => stock.returnOnEquity).filter(Boolean);
        
        const averages = {
            pe: peValues.length ? peValues.reduce((sum, val) => sum + val, 0) / peValues.length : 0,
            priceToBook: priceToBookValues.length ? priceToBookValues.reduce((sum, val) => sum + val, 0) / priceToBookValues.length : 0,
            profitMargin: profitMarginValues.length ? profitMarginValues.reduce((sum, val) => sum + val, 0) / profitMarginValues.length : 0,
            returnOnEquity: roeValues.length ? roeValues.reduce((sum, val) => sum + val, 0) / roeValues.length : 0,
            performance: relatedStocks.map(stock => stock.percentChange).filter(Boolean),
        };
        
        setIndustryAverage(averages);
    };
    
    // Calculate technical indicators for analysis tab
    const calculateTechnicalIndicators = (priceData) => {
        if (!priceData || priceData.length < 50) return;
        
        // Simple calculations to simulate technical indicators
        const prices = priceData.map(item => item.close || item.value);
        const recentPrices = prices.slice(-10);
        const olderPrices = prices.slice(-50, -10);
        
        const recentAvg = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
        const olderAvg = olderPrices.reduce((sum, price) => sum + price, 0) / olderPrices.length;
        
        // Calculate momentum (simplified)
        const momentum = recentPrices[recentPrices.length - 1] - recentPrices[0];
        
        // Calculate RSI (simplified)
        let gains = 0, losses = 0;
        for (let i = 1; i < recentPrices.length; i++) {
            const diff = recentPrices[i] - recentPrices[i-1];
            if (diff > 0) gains += diff;
            else losses -= diff;
        }
        const rsi = gains === 0 ? 0 : 100 - (100 / (1 + (gains / losses)));
        
        // Calculate MACD signal (simplified)
        const macdSignal = recentAvg > olderAvg ? 'bullish' : 'bearish';
        const macdStrength = Math.abs(recentAvg - olderAvg) / olderAvg * 100;
        
        // Calculate moving average signals
        const ma20Signal = recentAvg > olderAvg ? 'bullish' : 'bearish';
        const ma20Strength = Math.abs(recentAvg - olderAvg) / olderAvg * 100;
        
        // EMA signal (simplified)
        const emaSignal = momentum > 0 ? 'bullish' : 'bearish';
        const emaStrength = Math.abs(momentum) / recentPrices[0] * 100;
        
        // Overall technical score (-100 to 100)
        let score = 0;
        score += macdSignal === 'bullish' ? macdStrength : -macdStrength;
        score += rsi > 50 ? (rsi - 50) : -(50 - rsi);
        score += ma20Signal === 'bullish' ? ma20Strength : -ma20Strength;
        score += emaSignal === 'bullish' ? emaStrength : -emaStrength;
        score = Math.min(Math.max(score, -100), 100);
        
        setTechnicalScore(score);
        setTechnicalSignals({
            macd: { 
                signal: macdSignal, 
                strength: macdStrength 
            },
            rsi: { 
                signal: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral', 
                strength: rsi 
            },
            ma: { 
                signal: ma20Signal, 
                strength: ma20Strength 
            },
            ema: { 
                signal: emaSignal, 
                strength: emaStrength 
            }
        });
    };
    
    // Function to fetch related stocks based on sector from API
    const fetchRelatedStocks = async (sector) => {
        // This would be implemented with a real API call
        // For now, we'll use the mock data
        return getRelatedStocks(sector);
    };

    // Enhance handleTimeRangeChange to update the active button state
    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        // Generate new price data for the selected time range
        const newData = generateMockPriceData(range);
        setPriceData(newData);
        
        // Calculate technical indicators based on the new data
        calculateTechnicalIndicators(newData);
    };
    
    // Toggle watchlist status
    const toggleWatchlist = () => {
        setIsWatchlisted(!isWatchlisted);
        toast.success(isWatchlisted 
            ? `${stockData.symbol} removed from watchlist` 
            : `${stockData.symbol} added to watchlist`);
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
                debtToEquity: 0.68,
                profitMargin: 11.5,
                returnOnEquity: 9.8,
                freeCashFlow: 549800000000,
                priceToBook: 2.8,
                revenue: 7928000000000,
                revenueGrowth: 16.8,
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
                debtToEquity: 0.32,
                profitMargin: 20.5,
                returnOnEquity: 25.4,
                freeCashFlow: 320000000000,
                priceToBook: 5.1,
                revenue: 1560000000000,
                revenueGrowth: 10.2,
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
                debtToEquity: 0.45,
                profitMargin: 18.2,
                returnOnEquity: 21.3,
                freeCashFlow: 210000000000,
                priceToBook: 3.2,
                revenue: 980000000000,
                revenueGrowth: 14.5,
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
                debtToEquity: 0.75,
                profitMargin: 15.8,
                returnOnEquity: 18.7,
                freeCashFlow: 125000000000,
                priceToBook: 3.5,
                revenue: 650000000000,
                revenueGrowth: 12.4,
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

    // Render chart component with enhanced time frame selectors and chart type options
    const renderStockChart = () => {
        return (
            <div className="chart-container">
                <div className="chart-controls-wrapper">
                    <div className="chart-time-controls">
                        <div className="time-frame-title">Time Frame:</div>
                        <div className="time-frame-buttons">
                            <button 
                                className={`time-frame-btn ${timeRange === '1d' ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('1d')}
                            >1D</button>
                            <button 
                                className={`time-frame-btn ${timeRange === '1w' ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('1w')}
                            >1W</button>
                            <button 
                                className={`time-frame-btn ${timeRange === '1m' ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('1m')}
                            >1M</button>
                            <button 
                                className={`time-frame-btn ${timeRange === '3m' ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('3m')}
                            >3M</button>
                            <button 
                                className={`time-frame-btn ${timeRange === '6m' ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('6m')}
                            >6M</button>
                            <button 
                                className={`time-frame-btn ${timeRange === '1y' ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('1y')}
                            >1Y</button>
                            <button 
                                className={`time-frame-btn ${timeRange === '5y' ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('5y')}
                            >5Y</button>
                            <button 
                                className={`time-frame-btn ${timeRange === 'max' ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('max')}
                            >MAX</button>
                        </div>
                    </div>
                    <div className="chart-type-controls">
                        <div className="chart-type-title">Chart Type:</div>
                        <div className="chart-type-buttons">
                            <button 
                                className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                                onClick={() => setChartType('line')}
                            >Line</button>
                            <button 
                                className={`chart-type-btn ${chartType === 'candle' ? 'active' : ''}`}
                                onClick={() => setChartType('candle')}
                            >Candle</button>
                            <button 
                                className={`chart-type-btn ${chartType === 'area' ? 'active' : ''}`}
                                onClick={() => setChartType('area')}
                            >Area</button>
                        </div>
                    </div>
                </div>
                
                <MarketChart 
                    data={priceData} 
                    symbolName={stockData.name}
                    symbolCode={stockData.symbol}
                    onTimeRangeChange={handleTimeRangeChange}
                    chartType={chartType}
                    showTimeSelector={false} // Hide the component's time selector since we have our custom one
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
                <div className="section-header">
                    <h2>Related Stocks</h2>
                    <div className="section-description">
                        Companies in the same sector as {stockData.name} that you might be interested in.
                    </div>
                </div>
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
    
    // Show helpful tooltip information
    const handleTooltipShow = (key) => {
        setShowTooltip(key);
    };
    
    const handleTooltipHide = () => {
        setShowTooltip(null);
    };
    
    // Get explanation for financial metrics for new users
    const getMetricExplanation = (key) => {
        const explanations = {
            'pe': 'Price-to-Earnings ratio compares a company\'s share price to its earnings per share. A lower P/E may indicate the stock is undervalued.',
            'eps': 'Earnings Per Share is the company\'s profit divided by outstanding shares. Higher EPS is generally better.',
            'marketCap': 'Market Capitalization is the total value of a company\'s outstanding shares, indicating company size.',
            'dividendYield': 'Dividend Yield shows how much a company pays out in dividends each year relative to its stock price.',
            'volume': 'Trading Volume is the number of shares traded in a specific period, indicating market activity.',
            'beta': 'Beta measures a stock\'s volatility compared to the market. A beta greater than 1 indicates higher volatility.',
            'debtToEquity': 'Debt-to-Equity ratio shows how much debt a company is using to finance its assets relative to the value of shareholders\' equity.',
            'profitMargin': 'Profit Margin is the percentage of revenue that translates into profit, indicating efficiency.',
            'returnOnEquity': 'Return on Equity shows how efficiently a company uses investments to generate earnings growth.',
            'priceToBook': 'Price-to-Book ratio compares a company\'s market value to its book value, indicating if a stock is overvalued or undervalued.'
        };
        
        return explanations[key] || 'No explanation available';
    };

    // Render performance comparison chart
    const renderPerformanceComparison = () => {
        if (!industryAverage || !stockData) return null;
        
        const metrics = [
            { key: 'pe', name: 'P/E Ratio', stockValue: stockData.pe, industryValue: industryAverage.pe },
            { key: 'priceToBook', name: 'Price/Book', stockValue: stockData.priceToBook, industryValue: industryAverage.priceToBook },
            { key: 'profitMargin', name: 'Profit Margin', stockValue: stockData.profitMargin, industryValue: industryAverage.profitMargin },
            { key: 'returnOnEquity', name: 'ROE', stockValue: stockData.returnOnEquity, industryValue: industryAverage.returnOnEquity }
        ];
        
        return (
            <div className="performance-comparison">
                <div className="section-header">
                    <h2>Performance vs Industry</h2>
                    <div className="section-description">
                        How {stockData.symbol} compares to industry averages in key metrics.
                    </div>
                </div>
                <div className="comparison-grid">
                    {metrics.map(metric => {
                        const isBetter = metric.key === 'pe' || metric.key === 'priceToBook' ? 
                            metric.stockValue <= metric.industryValue : 
                            metric.stockValue >= metric.industryValue;
                            
                        return (
                            <div key={metric.key} className="comparison-item">
                                <div className="comparison-header">
                                    <span className="comparison-label">{metric.name}</span>
                                    <div 
                                        className="info-icon" 
                                        onMouseEnter={() => handleTooltipShow(metric.key)}
                                        onMouseLeave={handleTooltipHide}
                                    >
                                        <span>ⓘ</span>
                                        {showTooltip === metric.key && (
                                            <div className="tooltip-content">
                                                {getMetricExplanation(metric.key)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="comparison-bars">
                                    <div className="comparison-values">
                                        <span>Stock: <strong>{metric.stockValue.toFixed(2)}</strong></span>
                                        <span>Industry: <strong>{metric.industryValue.toFixed(2)}</strong></span>
                                    </div>
                                    <div className="comparison-bar-container">
                                        <div className="industry-bar" style={{ 
                                            width: '100%',
                                            background: '#e2e8f0' 
                                        }}></div>
                                        <div className={`stock-bar ${isBetter ? 'better' : 'worse'}`} style={{ 
                                            width: `${Math.min(metric.stockValue / metric.industryValue * 100, 200)}%`,
                                            background: isBetter ? '#10b981' : '#ef4444'
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
    
    // Render financial highlights
    const renderFinancialHighlights = () => {
        return (
            <div className="financial-highlights">
                <div className="section-header">
                    <h2>Financial Highlights</h2>
                    <div className="section-description">
                        Key financial metrics to understand {stockData.symbol}'s performance.
                    </div>
                </div>
                <div className="financial-metrics-grid">
                    <div className="financial-metric">
                        <span className="metric-label">Revenue</span>
                        <span className="metric-value">{formatIndianNumber(stockData.revenue)}</span>
                        <div className="metric-trend positive">
                            +{stockData.revenueGrowth.toFixed(1)}% YoY
                        </div>
                    </div>
                    <div className="financial-metric">
                        <span className="metric-label">Free Cash Flow</span>
                        <span className="metric-value">{formatIndianNumber(stockData.freeCashFlow)}</span>
                    </div>
                    <div className="financial-metric">
                        <span className="metric-label">Debt to Equity</span>
                        <span className="metric-value">{stockData.debtToEquity.toFixed(2)}</span>
                        <div className={`metric-indicator ${stockData.debtToEquity < 1 ? 'good' : 'caution'}`}>
                            {stockData.debtToEquity < 1 ? 'Good' : 'High'}
                        </div>
                    </div>
                    <div className="financial-metric">
                        <span className="metric-label">Profit Margin</span>
                        <span className="metric-value">{stockData.profitMargin.toFixed(1)}%</span>
                        <div className={`metric-indicator ${stockData.profitMargin > 10 ? 'good' : 'caution'}`}>
                            {stockData.profitMargin > 10 ? 'Good' : 'Low'}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    // Render stockholder information
    const renderStockholderValue = () => {
        return (
            <div className="stockholder-value">
                <div className="section-header">
                    <h2>Stockholder Value</h2>
                </div>
                <div className="value-indicators">
                    <div className="value-indicator">
                        <div className="indicator-title">
                            <span className="indicator-icon dividend"></span>
                            <span>Dividend</span>
                        </div>
                        <div className="indicator-value">
                            ₹{stockData.dividend.toFixed(2)} per share
                        </div>
                        <div className="indicator-description">
                            Yield: {stockData.dividendYield.toFixed(2)}%
                        </div>
                    </div>
                    <div className="value-indicator">
                        <div className="indicator-title">
                            <span className="indicator-icon return"></span>
                            <span>Return on Equity</span>
                        </div>
                        <div className="indicator-value">
                            {stockData.returnOnEquity.toFixed(1)}%
                        </div>
                        <div className="indicator-description">
                            {stockData.returnOnEquity > 15 ? 'Strong' : 'Average'} returns to shareholders
                        </div>
                    </div>
                    <div className="value-indicator">
                        <div className="indicator-title">
                            <span className="indicator-icon growth"></span>
                            <span>EPS Growth</span>
                        </div>
                        <div className="indicator-value">
                            12.5% YoY
                        </div>
                        <div className="indicator-description">
                            Consistent earnings growth
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    // Render trading insights for beginners
    const renderTradingInsights = () => {
        return (
            <div className="trading-insights">
                <div className="section-header">
                    <h2>Trading Insights</h2>
                    <div className="section-description">
                        Helpful information for making trading decisions
                    </div>
                </div>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h3>What does P/E ratio mean?</h3>
                        <p>The Price-to-Earnings (P/E) ratio of {stockData.pe.toFixed(2)} means investors are paying ₹{stockData.pe.toFixed(2)} for each rupee of annual earnings.</p>
                        <p className="insight-context">
                            {stockData.pe < 15 ? 'A P/E below 15 may indicate the stock is undervalued.' : 
                             stockData.pe > 30 ? 'A P/E above 30 may indicate the stock is expensive.' :
                             'This P/E is within the moderate range for Indian markets.'}
                        </p>
                    </div>
                    <div className="insight-card">
                        <h3>Should you buy {stockData.symbol}?</h3>
                        <p>Based on analyst recommendations:</p>
                        <div className="recommendation-summary">
                            <div className="summary-count">
                                <span className="buy">{stockData.recommendations.buy}</span> Buy
                            </div>
                            <div className="summary-count">
                                <span className="hold">{stockData.recommendations.hold}</span> Hold
                            </div>
                            <div className="summary-count">
                                <span className="sell">{stockData.recommendations.sell}</span> Sell
                            </div>
                        </div>
                        <p className="insight-action">
                            Always do your own research before investing.
                        </p>
                    </div>
                    <div className="insight-card risk-assessment">
                        <h3>Risk Assessment</h3>
                        <div className="risk-meter">
                            <div className="risk-label">Low</div>
                            <div className="risk-bar-container">
                                <div className="risk-bar" style={{ 
                                    width: `${Math.min((stockData.beta * 50), 100)}%`
                                }}></div>
                            </div>
                            <div className="risk-label">High</div>
                        </div>
                        <div className="risk-description">
                            Beta: {stockData.beta.toFixed(2)}
                            <span className="risk-explanation">
                                {stockData.beta < 0.8 ? 'Lower volatility than market' : 
                                 stockData.beta > 1.2 ? 'Higher volatility than market' : 
                                 'Similar volatility to market'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    // Render enhanced stock overview section with key stats
    const renderStockOverview = () => {
        if (!stockData) return null;
        
        return (
            <div className="stock-overview-section">
                <div className="section-header">
                    <h2>Company Overview</h2>
                </div>
                <div className="company-description">
                    <p>{stockData.about}</p>
                </div>
                
                <div className="key-stats-section">
                    <div className="section-header">
                        <h2>Key Statistics</h2>
                        <div className="section-description">
                            Important metrics for evaluating {stockData.symbol}'s performance and valuation.
                        </div>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">Market Cap</span>
                                <div 
                                    className="info-icon" 
                                    onMouseEnter={() => handleTooltipShow('marketCap')}
                                    onMouseLeave={handleTooltipHide}
                                >
                                    <span>ⓘ</span>
                                    {showTooltip === 'marketCap' && (
                                        <div className="tooltip-content">
                                            {getMetricExplanation('marketCap')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="stat-value">{formatIndianNumber(stockData.marketCap)}</span>
                        </div>
                        
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">P/E Ratio</span>
                                <div 
                                    className="info-icon" 
                                    onMouseEnter={() => handleTooltipShow('pe')}
                                    onMouseLeave={handleTooltipHide}
                                >
                                    <span>ⓘ</span>
                                    {showTooltip === 'pe' && (
                                        <div className="tooltip-content">
                                            {getMetricExplanation('pe')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="stat-value">{stockData.pe.toFixed(2)}</span>
                        </div>
                        
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">EPS (TTM)</span>
                                <div 
                                    className="info-icon" 
                                    onMouseEnter={() => handleTooltipShow('eps')}
                                    onMouseLeave={handleTooltipHide}
                                >
                                    <span>ⓘ</span>
                                    {showTooltip === 'eps' && (
                                        <div className="tooltip-content">
                                            {getMetricExplanation('eps')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="stat-value">₹{stockData.eps.toFixed(2)}</span>
                        </div>
                        
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">Revenue</span>
                            </div>
                            <span className="stat-value">{formatIndianNumber(stockData.revenue)}</span>
                        </div>
                        
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">Debt to Equity</span>
                                <div 
                                    className="info-icon" 
                                    onMouseEnter={() => handleTooltipShow('debtToEquity')}
                                    onMouseLeave={handleTooltipHide}
                                >
                                    <span>ⓘ</span>
                                    {showTooltip === 'debtToEquity' && (
                                        <div className="tooltip-content">
                                            {getMetricExplanation('debtToEquity')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="stat-value">{stockData.debtToEquity.toFixed(2)}</span>
                        </div>
                        
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">Profit Margin</span>
                                <div 
                                    className="info-icon" 
                                    onMouseEnter={() => handleTooltipShow('profitMargin')}
                                    onMouseLeave={handleTooltipHide}
                                >
                                    <span>ⓘ</span>
                                    {showTooltip === 'profitMargin' && (
                                        <div className="tooltip-content">
                                            {getMetricExplanation('profitMargin')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="stat-value">{stockData.profitMargin.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    // Render enhanced technical analysis section
    const renderTechnicalAnalysis = () => {
        if (!stockData) return null;
        
        const technicalIndicators = {
            macd: stockData.change >= 0 ? 'BULLISH' : 'BEARISH',
            rsi: 'NEUTRAL',
            movingAverage: stockData.change >= 0 ? 'BULLISH' : 'BEARISH',
            bollingerBands: stockData.change >= 0 ? 'UPPER BAND' : 'LOWER BAND',
            stochastic: stockData.change >= 0 ? 'OVERBOUGHT' : 'OVERSOLD',
            adx: stockData.change >= 0 ? 'STRONG TREND' : 'WEAK TREND'
        };
        
        return (
            <div className="technical-analysis-section">
                <div className="section-header">
                    <h2>Technical Analysis</h2>
                    <div className="section-description">
                        Short-term technical analysis based on price action and indicators
                    </div>
                </div>
                
                <div className="technical-summary">
                    <div className={`technical-signal ${stockData.change >= 0 ? 'positive' : 'negative'}`}>
                        <h3>{stockData.change >= 0 ? 'BULLISH SIGNALS' : 'BEARISH SIGNALS'}</h3>
                        <p>
                            {stockData.change >= 0 ? 
                                `${stockData.symbol} is showing positive momentum with bullish technical indicators. Current price is above key moving averages.` : 
                                `${stockData.symbol} is showing negative momentum with bearish technical indicators. Current price is below key moving averages.`}
                        </p>
                    </div>
                    
                    <div className="technical-indicators-grid">
                        {Object.entries(technicalIndicators).map(([indicator, value]) => (
                            <div className="technical-indicator" key={indicator}>
                                <div className="indicator-name">{indicator.toUpperCase()}</div>
                                <div className={`indicator-value ${
                                    (value === 'BULLISH' || value === 'STRONG TREND' || value === 'UPPER BAND') ? 'positive' : 
                                    (value === 'BEARISH' || value === 'WEAK TREND' || value === 'LOWER BAND' || value === 'OVERSOLD') ? 'negative' : 'neutral'
                                }`}>
                                    {value}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="technical-explanation">
                        <h4>What does this mean?</h4>
                        <p>
                            Technical indicators help identify potential entry and exit points based on historical price movements and volume. 
                            These signals are most effective when used alongside fundamental analysis and your investment strategy.
                        </p>
                        <div className="technical-timeframes">
                            <div className="timeframe">
                                <h5>Short-term Outlook (1-4 weeks)</h5>
                                <p className={stockData.change >= 0 ? 'positive' : 'negative'}>
                                    {stockData.change >= 0 ? 'BULLISH' : 'BEARISH'}
                                </p>
                            </div>
                            <div className="timeframe">
                                <h5>Medium-term Outlook (1-3 months)</h5>
                                <p className="neutral">NEUTRAL</p>
                            </div>
                            <div className="timeframe">
                                <h5>Long-term Outlook ({'>'}6 months)</h5>
                                <p className={stockData.pe < 20 ? 'positive' : 'neutral'}>
                                    {stockData.pe < 20 ? 'BULLISH' : 'NEUTRAL'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // New function to toggle the education panel
    const toggleEducationPanel = () => {
        setShowEducationPanel(!showEducationPanel);
    };
    
    // Handle changing the education topic
    const handleEducationTopicChange = (topic) => {
        setActiveEducationTopic(topic);
    };
    
    // Render education panel for new investors
    const renderEducationPanel = () => {
        const educationContent = {
            basics: {
                title: "Stock Market Basics",
                content: [
                    "Stocks represent ownership in a company. When you buy a stock, you're buying a small piece of that company.",
                    "Stock prices change based on supply and demand, influenced by factors like company performance, economic conditions, and market sentiment.",
                    "The goal of stock investment is typically to buy low and sell high, or to hold stocks that pay dividends."
                ]
            },
            metrics: {
                title: "Understanding Key Metrics",
                content: [
                    "P/E Ratio: Price-to-Earnings ratio measures a company's current share price relative to its earnings per share (EPS).",
                    "Market Cap: The total market value of a company's outstanding shares, calculated by multiplying the share price by the number of shares.",
                    "Dividend Yield: The annual dividend payment divided by the stock price, expressed as a percentage."
                ]
            },
            analysis: {
                title: "Technical vs. Fundamental Analysis",
                content: [
                    "Technical Analysis involves studying price movements and trading volumes to forecast future price trends.",
                    "Fundamental Analysis looks at a company's financial statements, industry position, and economic factors to determine its intrinsic value.",
                    "Most investors use a combination of both approaches to make investment decisions."
                ]
            },
            timeframes: {
                title: "Understanding Chart Time Frames",
                content: [
                    "Short-term charts (1D, 1W) are useful for day traders and those looking for entry/exit points.",
                    "Medium-term charts (1M, 3M, 6M) help identify trends and are useful for swing traders.",
                    "Long-term charts (1Y, 5Y, MAX) reveal historical patterns and are valuable for long-term investors."
                ]
            }
        };

        return (
            <div className={`education-panel ${showEducationPanel ? 'active' : ''}`}>
                <div className="education-header">
                    <h3>Investor Education</h3>
                    <button className="close-education-btn" onClick={toggleEducationPanel}>×</button>
                </div>
                
                <div className="education-tabs">
                    <button 
                        className={`education-tab ${activeEducationTopic === 'basics' ? 'active' : ''}`}
                        onClick={() => handleEducationTopicChange('basics')}
                    >
                        Basics
                    </button>
                    <button 
                        className={`education-tab ${activeEducationTopic === 'metrics' ? 'active' : ''}`}
                        onClick={() => handleEducationTopicChange('metrics')}
                    >
                        Metrics
                    </button>
                    <button 
                        className={`education-tab ${activeEducationTopic === 'analysis' ? 'active' : ''}`}
                        onClick={() => handleEducationTopicChange('analysis')}
                    >
                        Analysis
                    </button>
                    <button 
                        className={`education-tab ${activeEducationTopic === 'timeframes' ? 'active' : ''}`}
                        onClick={() => handleEducationTopicChange('timeframes')}
                    >
                        Time Frames
                    </button>
                </div>
                
                <div className="education-content">
                    <h4>{educationContent[activeEducationTopic].title}</h4>
                    <ul>
                        {educationContent[activeEducationTopic].content.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                    
                    <div className="learn-more">
                        <a href="#" onClick={(e) => e.preventDefault()}>Learn more about investing</a>
                    </div>
                </div>
            </div>
        );
    };

    // Calculate potential returns for the investment calculator
    const calculatePotentialReturns = (initialInvestment, years, expectedGrowthRate) => {
        const annualReturns = [];
        let currentValue = initialInvestment;
        
        for (let i = 1; i <= years; i++) {
            currentValue = currentValue * (1 + expectedGrowthRate / 100);
            annualReturns.push({
                year: i,
                value: currentValue,
                profit: currentValue - initialInvestment,
                percentGain: ((currentValue / initialInvestment) - 1) * 100
            });
        }
        
        return annualReturns;
    };
    
    // Render investment calculator component
    const renderInvestmentCalculator = () => {
        const [investment, setInvestment] = useState(10000);
        const [years, setYears] = useState(5);
        const [growthRate, setGrowthRate] = useState(12);
        const [showResults, setShowResults] = useState(false);
        
        const handleCalculate = () => {
            setShowResults(true);
        };
        
        const returns = calculatePotentialReturns(investment, years, growthRate);
        const finalValue = returns.length > 0 ? returns[returns.length - 1].value : investment;
        const totalProfit = finalValue - investment;
        const percentGain = ((finalValue / investment) - 1) * 100;
        
        return (
            <div className="investment-calculator">
                <div className="section-header">
                    <h2>Investment Calculator</h2>
                    <div className="section-description">
                        See how your investment in {stockData.symbol} could grow over time
                    </div>
                </div>
                
                <div className="calculator-container">
                    <div className="calculator-inputs">
                        <div className="input-group">
                            <label>Initial Investment (₹)</label>
                            <input 
                                type="number" 
                                value={investment}
                                onChange={(e) => setInvestment(Number(e.target.value))}
                                min="100"
                            />
                        </div>
                        
                        <div className="input-group">
                            <label>Time Period (Years)</label>
                            <input 
                                type="range" 
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                min="1"
                                max="30"
                                step="1"
                            />
                            <span className="range-value">{years} years</span>
                        </div>
                        
                        <div className="input-group">
                            <label>Expected Annual Growth Rate (%)</label>
                            <input 
                                type="range" 
                                value={growthRate}
                                onChange={(e) => setGrowthRate(Number(e.target.value))}
                                min="1"
                                max="30"
                                step="0.5"
                            />
                            <span className="range-value">{growthRate}%</span>
                            <div className="rate-suggestion">
                                <small>Industry average: {industryAverage ? (industryAverage.returnOnEquity || 12).toFixed(1) : 12}%</small>
                            </div>
                        </div>
                        
                        <button className="calculate-button" onClick={handleCalculate}>
                            Calculate Returns
                        </button>
                    </div>
                    
                    {showResults && (
                        <div className="calculator-results">
                            <div className="result-summary">
                                <div className="result-item">
                                    <span className="result-label">Initial Investment</span>
                                    <span className="result-value">₹{investment.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="result-item">
                                    <span className="result-label">Final Value</span>
                                    <span className="result-value">₹{finalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="result-item">
                                    <span className="result-label">Total Profit</span>
                                    <span className="result-value profit">₹{totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="result-item">
                                    <span className="result-label">Total Return</span>
                                    <span className="result-value profit">{percentGain.toFixed(2)}%</span>
                                </div>
                            </div>
                            
                            <div className="result-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Year</th>
                                            <th>Value (₹)</th>
                                            <th>Profit (₹)</th>
                                            <th>Return (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returns.map(year => (
                                            <tr key={year.year}>
                                                <td>{year.year}</td>
                                                <td>{year.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td>{year.profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td>{year.percentGain.toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="disclaimer">
                                <strong>Disclaimer:</strong> This is a simplified calculation for illustrative purposes only. 
                                Actual returns may vary based on market conditions, taxes, and other factors.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Generate social sentiment data
    const generateSocialSentiment = () => {
        // In a real implementation, this would come from an API
        // that aggregates social media mentions, news sentiment, etc.
        return {
            overall: Math.random() > 0.5 ? 'positive' : 'negative',
            score: Math.floor(Math.random() * 100),
            sources: {
                twitter: Math.floor(Math.random() * 100),
                news: Math.floor(Math.random() * 100),
                reddit: Math.floor(Math.random() * 100),
                stockForums: Math.floor(Math.random() * 100)
            },
            trending: Math.random() > 0.7,
            recentMentions: Math.floor(Math.random() * 1000) + 100,
            sentiment: {
                positive: Math.floor(Math.random() * 70) + 30,
                negative: Math.floor(Math.random() * 40),
                neutral: Math.floor(Math.random() * 30)
            }
        };
    };
    
    // Render social sentiment component
    const renderSocialSentiment = () => {
        const sentiment = generateSocialSentiment();
        const sentimentClass = sentiment.overall === 'positive' ? 'positive' : 'negative';
        
        // Calculate sentiment percentages for the chart
        const totalSentiment = sentiment.sentiment.positive + sentiment.sentiment.negative + sentiment.sentiment.neutral;
        const positivePercent = (sentiment.sentiment.positive / totalSentiment) * 100;
        const negativePercent = (sentiment.sentiment.negative / totalSentiment) * 100;
        const neutralPercent = (sentiment.sentiment.neutral / totalSentiment) * 100;
        
        return (
            <div className="social-sentiment-section">
                <div className="section-header">
                    <h2>Social Sentiment</h2>
                    <div className="section-description">
                        How investors and analysts are talking about {stockData.symbol} online
                    </div>
                </div>
                
                <div className="sentiment-overview">
                    <div className={`sentiment-indicator ${sentimentClass}`}>
                        <div className="sentiment-score">{sentiment.score}</div>
                        <div className="sentiment-label">
                            {sentiment.overall === 'positive' ? 'BULLISH' : 'BEARISH'}
                            <span className="sentiment-trend">
                                {sentiment.trending && '🔥 Trending'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="sentiment-details">
                        <div className="sentiment-mentions">
                            <span className="mentions-count">{sentiment.recentMentions.toLocaleString()}</span>
                            <span className="mentions-label">mentions in the last 24 hours</span>
                        </div>
                        
                        <div className="sentiment-distribution">
                            <div className="sentiment-bar-container">
                                <div className="sentiment-bar positive" style={{ width: `${positivePercent}%` }}></div>
                                <div className="sentiment-bar neutral" style={{ width: `${neutralPercent}%` }}></div>
                                <div className="sentiment-bar negative" style={{ width: `${negativePercent}%` }}></div>
                            </div>
                            <div className="sentiment-legend">
                                <div className="legend-item">
                                    <span className="legend-color positive"></span>
                                    <span>{sentiment.sentiment.positive}% Positive</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color neutral"></span>
                                    <span>{sentiment.sentiment.neutral}% Neutral</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color negative"></span>
                                    <span>{sentiment.sentiment.negative}% Negative</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="sentiment-sources">
                    <h4>Sentiment by Source</h4>
                    <div className="sources-grid">
                        <div className="source-item">
                            <span className="source-name">Twitter</span>
                            <div className="source-score-container">
                                <div 
                                    className={`source-score ${sentiment.sources.twitter > 50 ? 'positive' : 'negative'}`}
                                    style={{ width: `${sentiment.sources.twitter}%` }}
                                ></div>
                            </div>
                            <span className="source-value">{sentiment.sources.twitter}</span>
                        </div>
                        <div className="source-item">
                            <span className="source-name">News</span>
                            <div className="source-score-container">
                                <div 
                                    className={`source-score ${sentiment.sources.news > 50 ? 'positive' : 'negative'}`}
                                    style={{ width: `${sentiment.sources.news}%` }}
                                ></div>
                            </div>
                            <span className="source-value">{sentiment.sources.news}</span>
                        </div>
                        <div className="source-item">
                            <span className="source-name">Reddit</span>
                            <div className="source-score-container">
                                <div 
                                    className={`source-score ${sentiment.sources.reddit > 50 ? 'positive' : 'negative'}`}
                                    style={{ width: `${sentiment.sources.reddit}%` }}
                                ></div>
                            </div>
                            <span className="source-value">{sentiment.sources.reddit}</span>
                        </div>
                        <div className="source-item">
                            <span className="source-name">Stock Forums</span>
                            <div className="source-score-container">
                                <div 
                                    className={`source-score ${sentiment.sources.stockForums > 50 ? 'positive' : 'negative'}`}
                                    style={{ width: `${sentiment.sources.stockForums}%` }}
                                ></div>
                            </div>
                            <span className="source-value">{sentiment.sources.stockForums}</span>
                        </div>
                    </div>
                </div>
                
                <div className="sentiment-disclaimer">
                    <strong>Note:</strong> Social sentiment is not investment advice. Always do your own research before investing.
                </div>
            </div>
        );
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch(e.key) {
                // Tab navigation shortcuts
                case '1':
                    setActiveTab('overview');
                    break;
                case '2':
                    setActiveTab('fundamentals');
                    break;
                case '3':
                    setActiveTab('news');
                    break;
                case '4':
                    setActiveTab('analysis');
                    break;
                case '5':
                    setActiveTab('history');
                    break;
                case '6':
                    setActiveTab('calculator');
                    break;
                case '7':
                    setActiveTab('sentiment');
                    break;
                
                // Action shortcuts
                case 't':
                case 'T':
                    navigate(`/trade?symbol=${stockData.symbol}`);
                    break;
                case 'w':
                case 'W':
                    toggleWatchlist();
                    break;
                
                // Help shortcut
                case '?':
                    setShowKeyboardHelp(true);
                    break;
                    
                // Time range shortcuts
                case 'd':
                    handleTimeRangeChange('1d');
                    break;
                case 'w':
                    handleTimeRangeChange('1w');
                    break;
                case 'm':
                    handleTimeRangeChange('1m');
                    break;
                case 'y':
                    handleTimeRangeChange('1y');
                    break;
                    
                default:
                    break;
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeTab, symbol, navigate, toggleWatchlist]);
    
    // New state for keyboard shortcuts help modal
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
    
    // Render keyboard shortcuts help modal
    const renderKeyboardHelp = () => {
        if (!showKeyboardHelp) return null;
        
        return (
            <div className="keyboard-help-modal" onClick={() => setShowKeyboardHelp(false)}>
                <div className="keyboard-help-content" onClick={(e) => e.stopPropagation()}>
                    <div className="keyboard-help-header">
                        <h3>Keyboard Shortcuts</h3>
                        <button className="close-btn" onClick={() => setShowKeyboardHelp(false)}>×</button>
                    </div>
                    
                    <div className="shortcuts-list">
                        <h4>Navigation</h4>
                        <div className="shortcut-item">
                            <span className="shortcut-key">1</span>
                            <span className="shortcut-description">Overview Tab</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">2</span>
                            <span className="shortcut-description">Fundamentals Tab</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">3</span>
                            <span className="shortcut-description">News Tab</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">4</span>
                            <span className="shortcut-description">Analysis Tab</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">5</span>
                            <span className="shortcut-description">Price History Tab</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">6</span>
                            <span className="shortcut-description">Calculator Tab</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">7</span>
                            <span className="shortcut-description">Sentiment Tab</span>
                        </div>
                        
                        <h4>Actions</h4>
                        <div className="shortcut-item">
                            <span className="shortcut-key">T</span>
                            <span className="shortcut-description">Trade this stock</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">W</span>
                            <span className="shortcut-description">Add/Remove from Watchlist</span>
                        </div>
                        
                        <h4>Chart Time Range</h4>
                        <div className="shortcut-item">
                            <span className="shortcut-key">D</span>
                            <span className="shortcut-description">1 Day</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">W</span>
                            <span className="shortcut-description">1 Week</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">M</span>
                            <span className="shortcut-description">1 Month</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">Y</span>
                            <span className="shortcut-description">1 Year</span>
                        </div>
                        
                        <h4>Help</h4>
                        <div className="shortcut-item">
                            <span className="shortcut-key">?</span>
                            <span className="shortcut-description">Show Keyboard Shortcuts</span>
                        </div>
                    </div>
                    
                    <div className="keyboard-help-footer">
                        Press Escape or click outside to close this dialog
                    </div>
                </div>
            </div>
        );
    };

    // Main render method with updated content to include new features
    return (
        <div className="stock-details-container">
            {loading ? (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Loading stock details...</div>
                </div>
            ) : !stockData ? (
                <div className="error-message">
                    <h2>Stock Not Found</h2>
                    <p>Sorry, we couldn't find data for this stock. Please try another symbol.</p>
                    <button className="back-button" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            ) : (
                <>
                    {/* Keyboard shortcuts help modal */}
                    {renderKeyboardHelp()}
                    
                    <div className="help-panel">
                        <div className="help-icon" title="Show keyboard shortcuts">?</div>
                    </div>
                    
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span className="breadcrumb-separator">/</span>
                        <Link to="/market">Market</Link>
                        <span className="breadcrumb-separator">/</span>
                        <span>{stockData.symbol}</span>
                    </div>
                    
                    <div className="stock-header">
                        <div className="stock-title">
                            <h1>{stockData.name}</h1>
                            <div className="stock-exchange">
                                {stockData.symbol}
                                <div className="exchange-badge">{stockData.exchange}</div>
                                <div className="exchange-badge">{stockData.sector}</div>
                            </div>
                        </div>
                        
                        <div className="stock-actions">
                            <Link to={`/trade?symbol=${stockData.symbol}`} className="trade-button">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Trade
                            </Link>
                            
                            <button 
                                className={`add-watchlist-button ${isWatchlisted ? 'watchlisted' : ''}`}
                                onClick={toggleWatchlist}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill={isWatchlisted ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="stock-price-info">
                        <div className="current-price-container">
                            <div className="current-price">
                                <h2 className="price-value">₹{stockData.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                                <div className={`price-change ${stockData.change >= 0 ? 'positive' : 'negative'}`}>
                                    <span className="price-change-icon">{stockData.change >= 0 ? '↑' : '↓'}</span>
                                    <span>₹{Math.abs(stockData.change).toFixed(2)}</span>
                                    <span>({Math.abs(stockData.percentChange).toFixed(2)}%)</span>
                                </div>
                            </div>
                            <div className="price-updated">Last updated: {new Date().toLocaleTimeString()}</div>
                        </div>
                        
                        <div className="price-details">
                            <div className="detail">
                                <div className="label">Open</div>
                                <div className="value">₹{stockData.open.toFixed(2)}</div>
                            </div>
                            <div className="detail">
                                <div className="label">High</div>
                                <div className="value">₹{stockData.high.toFixed(2)}</div>
                            </div>
                            <div className="detail">
                                <div className="label">Low</div>
                                <div className="value">₹{stockData.low.toFixed(2)}</div>
                            </div>
                            <div className="detail">
                                <div className="label">Prev Close</div>
                                <div className="value">₹{stockData.close.toFixed(2)}</div>
                            </div>
                            <div className="detail">
                                <div className="label">Volume</div>
                                <div className="value">{stockData.volume.toLocaleString()}</div>
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
                        <button 
                            className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
                            onClick={() => setActiveTab('calculator')}
                        >
                            Calculator
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'sentiment' ? 'active' : ''}`}
                            onClick={() => setActiveTab('sentiment')}
                        >
                            Sentiment
                        </button>
                    </div>
                    
                    {activeTab === 'overview' && (
                        <div className="tab-content" ref={overviewRef}>
                            <div className="about-section">
                                <div className="section-header">
                                    <h2>About {stockData.name}</h2>
                                </div>
                                <p>{stockData.about}</p>
                            </div>
                            
                            <div className="key-stats-section">
                                <div className="section-header">
                                    <h2>Key Statistics</h2>
                                </div>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-header">
                                            <span className="stat-label">Market Cap</span>
                                            <div 
                                                className="info-icon" 
                                                onMouseEnter={() => handleTooltipShow('marketCap')}
                                                onMouseLeave={handleTooltipHide}
                                            >
                                                <span>ⓘ</span>
                                                {showTooltip === 'marketCap' && (
                                                    <div className="tooltip-content">
                                                        {getMetricExplanation('marketCap')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="stat-value">{formatIndianNumber(stockData.marketCap)}</span>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-header">
                                            <span className="stat-label">P/E Ratio</span>
                                            <div 
                                                className="info-icon" 
                                                onMouseEnter={() => handleTooltipShow('pe')}
                                                onMouseLeave={handleTooltipHide}
                                            >
                                                <span>ⓘ</span>
                                                {showTooltip === 'pe' && (
                                                    <div className="tooltip-content">
                                                        {getMetricExplanation('pe')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="stat-value">{stockData.pe.toFixed(2)}</span>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-header">
                                            <span className="stat-label">EPS</span>
                                            <div 
                                                className="info-icon" 
                                                onMouseEnter={() => handleTooltipShow('eps')}
                                                onMouseLeave={handleTooltipHide}
                                            >
                                                <span>ⓘ</span>
                                                {showTooltip === 'eps' && (
                                                    <div className="tooltip-content">
                                                        {getMetricExplanation('eps')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="stat-value">₹{stockData.eps.toFixed(2)}</span>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-header">
                                            <span className="stat-label">Dividend Yield</span>
                                            <div 
                                                className="info-icon" 
                                                onMouseEnter={() => handleTooltipShow('dividendYield')}
                                                onMouseLeave={handleTooltipHide}
                                            >
                                                <span>ⓘ</span>
                                                {showTooltip === 'dividendYield' && (
                                                    <div className="tooltip-content">
                                                        {getMetricExplanation('dividendYield')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="stat-value">{stockData.dividendYield.toFixed(2)}%</span>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-header">
                                            <span className="stat-label">52 Week High</span>
                                        </div>
                                        <span className="stat-value">₹{stockData.yearHigh.toFixed(2)}</span>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-header">
                                            <span className="stat-label">52 Week Low</span>
                                        </div>
                                        <span className="stat-value">₹{stockData.yearLow.toFixed(2)}</span>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-header">
                                            <span className="stat-label">Avg Volume</span>
                                            <div 
                                                className="info-icon" 
                                                onMouseEnter={() => handleTooltipShow('volume')}
                                                onMouseLeave={handleTooltipHide}
                                            >
                                                <span>ⓘ</span>
                                                {showTooltip === 'volume' && (
                                                    <div className="tooltip-content">
                                                        {getMetricExplanation('volume')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="stat-value">{stockData.avgVolume.toLocaleString()}</span>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-header">
                                            <span className="stat-label">Beta</span>
                                            <div 
                                                className="info-icon" 
                                                onMouseEnter={() => handleTooltipShow('beta')}
                                                onMouseLeave={handleTooltipHide}
                                            >
                                                <span>ⓘ</span>
                                                {showTooltip === 'beta' && (
                                                    <div className="tooltip-content">
                                                        {getMetricExplanation('beta')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="stat-value">{stockData.beta.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {renderTradingInsights()}
                            
                            {renderRelatedStocks()}
                            
                            <button className="toggle-education-btn" onClick={toggleEducationPanel}>
                                {showEducationPanel ? 'Hide' : 'Show'} Investor Education
                            </button>
                            
                            {showEducationPanel && renderEducationPanel()}
                            
                            <div className="cta-footer">
                                <div className="cta-content">
                                    <h3>Ready to invest in {stockData.symbol}?</h3>
                                    <p>Start trading now with no commission fees</p>
                                </div>
                                <Link to={`/trade?symbol=${stockData.symbol}`} className="cta-button">
                                    Trade Now
                                </Link>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'fundamentals' && (
                        <div className="tab-content fundamentals-tab">
                            {renderFinancialHighlights()}
                            {renderPerformanceComparison()}
                            {renderStockholderValue()}
                            
                            <div className="financials-section">
                                <h2>Detailed Financial Statements</h2>
                                <p>Access comprehensive financial statements including Balance Sheet, Income Statement, and Cash Flow.</p>
                                <button className="upgrade-button">
                                    Upgrade to Pro
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'news' && (
                        <div className="tab-content news-tab">
                            <h2>Latest News</h2>
                            <ul className="news-list">
                                {stockData.news && stockData.news.map(item => (
                                    <li key={item.id} className="news-item">
                                        <div className="news-content">
                                            <h3 className="news-title">{item.title}</h3>
                                            <span className="news-date">{item.date}</span>
                                            <p className="news-summary">
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                                                Nulla facilisi. Sed euismod, nisl eget ultricies...
                                            </p>
                                        </div>
                                        <button className="read-more">Read More</button>
                                    </li>
                                ))}
                                {(!stockData.news || stockData.news.length === 0) && (
                                    <p>No recent news available for this stock.</p>
                                )}
                            </ul>
                        </div>
                    )}
                    
                    {activeTab === 'analysis' && (
                        <div className="tab-content analysis-tab">
                            <div className="analyst-recommendations">
                                <div className="section-header">
                                    <h2>Analyst Recommendations</h2>
                                    <div className="section-description">
                                        Based on {
                                            stockData.recommendations ?
                                            (stockData.recommendations.buy + 
                                             stockData.recommendations.hold + 
                                             stockData.recommendations.sell) : 0
                                        } analyst ratings
                                    </div>
                                </div>
                                {renderRecommendationChart()}
                                
                                <div className="consensus-summary">
                                    <div className="consensus-rating">
                                        <span className="rating-label">Consensus:</span>
                                        <span className="rating-value positive">Buy</span>
                                    </div>
                                    <p className="consensus-description">
                                        Analysts are generally positive on {stockData.symbol}, citing strong growth prospects 
                                        and competitive positioning in the {stockData.industry} industry.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="technical-indicators">
                                <div className="section-header">
                                    <h2>Technical Analysis</h2>
                                    <div className="section-description">
                                        Based on various technical indicators and trading patterns
                                    </div>
                                </div>
                                
                                <div className="indicator-summary">
                                    {technicalScore > 0 ? (
                                        <div className="summary-positive">
                                            <div className="indicator-signal">BULLISH</div>
                                            <p>The technical indicators suggest a bullish outlook for {stockData.symbol} at current levels.</p>
                                        </div>
                                    ) : (
                                        <div className="summary-negative">
                                            <div className="indicator-signal">BEARISH</div>
                                            <p>The technical indicators suggest a bearish outlook for {stockData.symbol} at current levels.</p>
                                        </div>
                                    )}
                                    
                                    <div className="technical-details">
                                        <div className={`technical-item ${technicalSignals.macd.signal === 'bullish' ? 'positive' : 'negative'}`}>
                                            <div className="detail-name">MACD</div>
                                            <div className="detail-signal">
                                                {technicalSignals.macd.signal.toUpperCase()}
                                            </div>
                                        </div>
                                        <div className={`technical-item ${technicalSignals.rsi.signal === 'oversold' ? 'positive' : technicalSignals.rsi.signal === 'overbought' ? 'negative' : ''}`}>
                                            <div className="detail-name">RSI</div>
                                            <div className="detail-signal">
                                                {technicalSignals.rsi.signal.toUpperCase()} ({technicalSignals.rsi.strength.toFixed(1)})
                                            </div>
                                        </div>
                                        <div className={`technical-item ${technicalSignals.ma.signal === 'bullish' ? 'positive' : 'negative'}`}>
                                            <div className="detail-name">Moving Avg</div>
                                            <div className="detail-signal">
                                                {technicalSignals.ma.signal.toUpperCase()}
                                            </div>
                                        </div>
                                        <div className={`technical-item ${technicalSignals.ema.signal === 'bullish' ? 'positive' : 'negative'}`}>
                                            <div className="detail-name">EMA</div>
                                            <div className="detail-signal">
                                                {technicalSignals.ema.signal.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'history' && (
                        <div className="tab-content">
                            {renderPriceHistoryTable()}
                        </div>
                    )}

                    {/* New Calculator Tab */}
                    {activeTab === 'calculator' && (
                        <div className="tab-content">
                            {renderInvestmentCalculator()}
                        </div>
                    )}

                    {/* New Sentiment Tab */}
                    {activeTab === 'sentiment' && (
                        <div className="tab-content">
                            <div className="social-sentiment-section">
                                <div className="section-header">
                                    <h2>Social Sentiment</h2>
                                    <div className="section-description">
                                        How investors and analysts are talking about {stockData.symbol} online
                                    </div>
                                </div>
                                
                                <div className="sentiment-overview">
                                    <div className={`sentiment-indicator ${Math.random() > 0.5 ? 'positive' : 'negative'}`}>
                                        <div className="sentiment-score">{Math.floor(Math.random() * 100)}</div>
                                        <div className="sentiment-label">
                                            {Math.random() > 0.5 ? 'BULLISH' : 'BEARISH'}
                                            {Math.random() > 0.7 && (
                                                <span className="sentiment-trend">🔥 Trending</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="sentiment-details">
                                        <div className="sentiment-mentions">
                                            <span className="mentions-count">{(Math.floor(Math.random() * 1000) + 100).toLocaleString()}</span>
                                            <span className="mentions-label">mentions in the last 24 hours</span>
                                        </div>
                                        
                                        <div className="sentiment-distribution">
                                            {(() => {
                                                const positive = Math.floor(Math.random() * 70) + 30;
                                                const negative = Math.floor(Math.random() * 40);
                                                const neutral = 100 - positive - negative;
                                                return (
                                                    <>
                                                        <div className="sentiment-bar-container">
                                                            <div className="sentiment-bar positive" style={{ width: `${positive}%` }}></div>
                                                            <div className="sentiment-bar neutral" style={{ width: `${neutral}%` }}></div>
                                                            <div className="sentiment-bar negative" style={{ width: `${negative}%` }}></div>
                                                        </div>
                                                        <div className="sentiment-legend">
                                                            <div className="legend-item">
                                                                <span className="legend-color positive"></span>
                                                                <span>{positive}% Positive</span>
                                                            </div>
                                                            <div className="legend-item">
                                                                <span className="legend-color neutral"></span>
                                                                <span>{neutral}% Neutral</span>
                                                            </div>
                                                            <div className="legend-item">
                                                                <span className="legend-color negative"></span>
                                                                <span>{negative}% Negative</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="sentiment-sources">
                                    <h4>Sentiment by Source</h4>
                                    <div className="sources-grid">
                                        {['Twitter', 'News', 'Reddit', 'Stock Forums'].map(source => {
                                            const score = Math.floor(Math.random() * 100);
                                            return (
                                                <div className="source-item" key={source}>
                                                    <span className="source-name">{source}</span>
                                                    <div className="source-score-container">
                                                        <div 
                                                            className={`source-score ${score > 50 ? 'positive' : 'negative'}`}
                                                            style={{ width: `${score}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="source-value">{score}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <div className="sentiment-disclaimer">
                                    <strong>Note:</strong> Social sentiment is not investment advice. Always do your own research before investing.
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StockDetails;