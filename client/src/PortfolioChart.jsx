import { useEffect, useState, useContext, useRef, useMemo } from 'react'
import axios from 'axios'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, AreaChart, Area, BarChart, Bar,
  ReferenceLine, Brush, ReferenceArea
} from 'recharts'
import { AuthContext } from './context/AuthContext'
import { API_URL } from './config'
import { toast } from 'react-toastify'
import './PortfolioChart.css'

function PortfolioChart() {
  const { user } = useContext(AuthContext)
  const [rawData, setRawData] = useState([])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState('line') // Changed from 'area' to 'line'
  const [timeRange, setTimeRange] = useState('all')
  const [hoverData, setHoverData] = useState(null)
  const [crosshairValues, setCrosshairValues] = useState(null)
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 })
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)

  // Enhanced timeframes
  const timeRangeOptions = [
    { id: '1d', label: '1D', days: 1 },
    { id: '1w', label: '1W', days: 7 },
    { id: '1m', label: '1M', days: 30 },
    { id: '3m', label: '3M', days: 90 },
    { id: '6m', label: '6M', days: 180 },
    { id: '1y', label: '1Y', days: 365 },
    { id: 'all', label: 'ALL', days: null }
  ]

  // Calculate moving averages for the chart
  const calculateMovingAverage = (data, period) => {
    if (!data || data.length === 0) return [];
    
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, ma: null };
      
      let sum = 0;
      for (let i = 0; i < period; i++) {
        sum += data[index - i].value;
      }
      return { ...item, ma: sum / period };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token')
        const trades = await axios.get(`${API_URL}/trades`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // Process trades to calculate portfolio value over time
        const portfolio = {}
        
        // Sort trades by date
        const sortedTrades = [...trades.data].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Get starting date to ensure continuous data
        let startDate = sortedTrades.length > 0 
          ? new Date(sortedTrades[0].date) 
          : new Date();
        startDate.setHours(0, 0, 0, 0);
        
        // Get ending date for the dataset
        let endDate = new Date();
        endDate.setHours(0, 0, 0, 0);
        
        // Create a continuous dataset with every date
        let currentDate = new Date(startDate);
        let dailyData = [];
        
        // Keep track of stocks and their quantities
        let holdings = {};
        let cashFlow = 0;
        
        // Create continuous daily data
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const localDateStr = new Date(dateStr).toLocaleDateString('en-IN');
          
          // Find trades for this date
          const dayTrades = sortedTrades.filter(trade => {
            const tradeDate = new Date(trade.date);
            return tradeDate.toISOString().split('T')[0] === dateStr;
          });
          
          // Process day's trades
          dayTrades.forEach(trade => {
            if (trade.type === 'buy') {
              // For buy trades, adjust cash flow
              cashFlow -= trade.quantity * trade.price;
              // Add to holdings
              holdings[trade.stockSymbol] = (holdings[trade.stockSymbol] || 0) + trade.quantity;
            } else {
              // For sell trades, adjust cash flow
              cashFlow += trade.quantity * trade.price;
              // Reduce holdings
              holdings[trade.stockSymbol] = (holdings[trade.stockSymbol] || 0) - trade.quantity;
            }
          });
          
          // Calculate portfolio value (cash + holdings value)
          let holdingsValue = 0;
          Object.entries(holdings).forEach(([symbol, quantity]) => {
            if (quantity <= 0) return; // Skip zero or negative holdings
            
            // Find the most recent purchase price as a proxy for current value
            // In a real app, you would fetch current market prices
            const lastTrade = sortedTrades
              .filter(t => t.stockSymbol === symbol && t.type === 'buy')
              .pop();
              
            if (lastTrade) {
              // Add 5% growth as a simplified market value approximation
              const estimatedPrice = lastTrade.price * 1.05;
              holdingsValue += quantity * estimatedPrice;
            }
          });
          
          const portfolioValue = cashFlow + holdingsValue;
          
          // Store value for this day
          dailyData.push({
            date: localDateStr,
            isoDate: dateStr,
            value: portfolioValue,
            holdings: holdingsValue,
            cash: cashFlow,
            tradeCount: dayTrades.length,
            volume: (dayTrades.length * 1000) || 500 // For visualization
          });
          
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Calculate daily change
        dailyData = dailyData.map((day, index) => {
          if (index === 0) {
            return {
              ...day,
              dayChange: 0,
              dayChangePercent: 0
            };
          }
          
          const prevValue = dailyData[index - 1].value;
          const dayChange = day.value - prevValue;
          const dayChangePercent = prevValue !== 0 ? (dayChange / Math.abs(prevValue)) * 100 : 0;
          
          return {
            ...day,
            dayChange,
            dayChangePercent
          };
        });
        
        // Add moving averages (7-day and 21-day)
        const dataWithMA = calculateMovingAverage(dailyData, 7);
        const dataWithBothMA = calculateMovingAverage(dataWithMA, 21);
        
        setRawData(dataWithBothMA);
      } catch (error) {
        toast.error('Failed to load portfolio chart data');
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user]);

  // Filter data based on selected time range whenever it changes
  useEffect(() => {
    if (rawData.length === 0) return;
    
    let filteredData = [...rawData];
    
    if (timeRange !== 'all') {
      const selectedTimeOption = timeRangeOptions.find(option => option.id === timeRange);
      
      if (selectedTimeOption && selectedTimeOption.days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - selectedTimeOption.days);
        const cutoffIsoDate = cutoffDate.toISOString().split('T')[0];
        
        filteredData = rawData.filter(item => 
          item.isoDate >= cutoffIsoDate
        );
      }
    }
    
    // Ensure we have data to display
    if (filteredData.length === 0 && rawData.length > 0) {
      // If filtered data is empty but we have raw data, use the latest few points
      filteredData = rawData.slice(-Math.min(7, rawData.length));
    }
    
    setData(filteredData);
  }, [rawData, timeRange]);

  // Update chart dimensions on mount and window resize
  useEffect(() => {
    const updateChartDimensions = () => {
      if (chartContainerRef.current) {
        const { width, height } = chartContainerRef.current.getBoundingClientRect();
        setChartDimensions({ width, height });
      }
    };
    
    updateChartDimensions();
    window.addEventListener('resize', updateChartDimensions);
    
    return () => {
      window.removeEventListener('resize', updateChartDimensions);
    };
  }, []);

  const formatRupee = (value) => {
    if (value === null || value === undefined) return '';
    return `₹${parseInt(value).toLocaleString('en-IN')}`;
  };

  const getChartColor = () => {
    if (data.length <= 1) return "#8884d8";
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    return lastValue >= firstValue ? "#0CA678" : "#E03131";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    if (timeRange === '1d' || timeRange === '1w') {
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: timeRange === 'all' || timeRange === '1y' ? 'numeric' : undefined 
    });
  };

  const handleMouseMove = (e) => {
    if (e && e.activePayload && e.activePayload.length) {
      setHoverData(e.activePayload[0].payload);
      setCrosshairValues({
        x: e.activeCoordinate.x,
        y: e.activeCoordinate.y
      });
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
    setCrosshairValues(null);
  };

  // Custom X-axis tick formatter based on time range
  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    
    // Convert to Date if it's not already
    const date = new Date(tickItem);
    
    switch (timeRange) {
      case '1d':
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      case '1w':
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
      case '1m':
        return date.toLocaleDateString('en-IN', { day: '2-digit' });
      case '3m':
      case '6m':
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      case '1y':
      case 'all':
        return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }
  };

  // Determine how many data points to skip for ticks based on time range and chart width
  const calculateTickInterval = () => {
    if (!data || data.length === 0) return 30;
    
    const dataLength = data.length;
    const baseTickCount = Math.min(10, Math.floor(chartDimensions.width / 100));
    
    if (dataLength <= baseTickCount) return 1;
    
    return Math.floor(dataLength / baseTickCount);
  };

  const renderChart = () => {
    const chartColor = getChartColor();
    const tickInterval = calculateTickInterval();
    
    // Filter data for X-axis ticks
    const tickFilter = (_, index) => index % tickInterval === 0;
    
    switch(chartType) {
      case 'area':
        return (
          <AreaChart 
            data={data}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={chartRef}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#666', fontSize: 11 }}
              tickFormatter={formatXAxis}
              interval={tickInterval === 1 ? 0 : 'preserveStartEnd'}
              minTickGap={5}
            />
            <YAxis 
              tickFormatter={formatRupee} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#666', fontSize: 11 }}
              width={80}
              domain={['auto', 'auto']}
              padding={{ top: 20, bottom: 20 }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#8884d8', strokeDasharray: '3 3' }}
            />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            
            {/* Moving Averages */}
            {(timeRange !== '1d' && timeRange !== '1w') && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="ma" 
                  name="7D MA" 
                  stroke="#2196F3" 
                  dot={false}
                  strokeWidth={1.5}
                  strokeOpacity={0.8}
                  isAnimationActive={false}
                />
              </>
            )}
            
            <Area 
              type="monotone" 
              dataKey="value" 
              name="Portfolio Value" 
              stroke={chartColor} 
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={750}
              activeDot={{ 
                r: 8, 
                fill: 'white', 
                stroke: chartColor,
                strokeWidth: 2
              }}
            />
            
            {/* Volume bars at the bottom of chart */}
            <Bar 
              dataKey="volume" 
              barSize={5}
              fill={chartColor} 
              fillOpacity={0.3}
              yAxisId="volume"
              name="Volume"
              hide
            />
            
            {/* Support for zooming/panning on extended charts */}
            {data.length > 30 && timeRange !== '1d' && (
              <Brush 
                dataKey="date"
                height={30}
                stroke={chartColor}
                fill="#f5f5f5"
                tickFormatter={formatXAxis}
              />
            )}
            
            <Legend />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart 
            data={data}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={chartRef}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#666', fontSize: 11 }}
              tickFormatter={formatXAxis}
              interval={tickInterval === 1 ? 0 : 'preserveStartEnd'}
              minTickGap={5}
            />
            <YAxis 
              tickFormatter={formatRupee} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#666', fontSize: 11 }}
              width={80}
              domain={['auto', 'auto']}
              padding={{ top: 20, bottom: 20 }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }}
            />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            <Bar 
              dataKey="value" 
              name="Portfolio Value" 
              fill={chartColor}
              animationDuration={750}
              radius={[4, 4, 0, 0]}
            />
            <Legend />
          </BarChart>
        );
      default:
        return (
          <LineChart 
            data={data}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={chartRef}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#666', fontSize: 11 }}
              tickFormatter={formatXAxis}
              interval={tickInterval === 1 ? 0 : 'preserveStartEnd'}
              minTickGap={5}
            />
            <YAxis 
              tickFormatter={formatRupee} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#666', fontSize: 11 }}
              width={80}
              domain={['auto', 'auto']}
              padding={{ top: 20, bottom: 20 }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#8884d8', strokeDasharray: '3 3' }}
            />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            
            {/* Moving Averages */}
            {(timeRange !== '1d' && timeRange !== '1w') && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="ma" 
                  name="7D MA" 
                  stroke="#2196F3" 
                  dot={false}
                  strokeWidth={1.5}
                  strokeOpacity={0.8}
                  isAnimationActive={false}
                />
              </>
            )}
            
            <Line 
              type="monotone" 
              dataKey="value" 
              name="Portfolio Value" 
              stroke={chartColor} 
              activeDot={{ 
                r: 8, 
                fill: 'white', 
                stroke: chartColor,
                strokeWidth: 2
              }}
              dot={false}
              strokeWidth={2}
              animationDuration={750}
            />
            <Legend />
            
            {/* Support for zooming/panning on extended charts */}
            {data.length > 30 && timeRange !== '1d' && (
              <Brush 
                dataKey="date"
                height={30}
                stroke={chartColor}
                fill="#f5f5f5"
                tickFormatter={formatXAxis}
              />
            )}
          </LineChart>
        );
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = data.value;
      const isPositive = data.dayChange >= 0;
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{formatDate(data.isoDate || data.date)}</p>
          <p className="tooltip-value">{formatRupee(value)}</p>
          {data.dayChange !== 0 && (
            <p className={`tooltip-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '▲' : '▼'} {formatRupee(Math.abs(data.dayChange))} 
              <span className="tooltip-percent">
                ({data.dayChangePercent.toFixed(2)}%)
              </span>
            </p>
          )}
          {data.ma && (
            <p className="tooltip-ma">
              7D MA: {formatRupee(data.ma)}
            </p>
          )}
        </div>
      );
    }
    
    return null;
  };

  const renderSummaryBar = () => {
    if (!data || data.length === 0) return null;
    
    // Default to start and end points
    let startValue = data[0]?.value || 0;
    let currentValue = data[data.length - 1]?.value || 0;
    
    // If hovering, use that data
    if (hoverData) {
      currentValue = hoverData.value;
    }
    
    const change = currentValue - startValue;
    const percentChange = startValue !== 0 ? (change / Math.abs(startValue)) * 100 : 0;
    const isPositive = change >= 0;
    
    return (
      <div className="chart-summary-bar">
        <div className="summary-details">
          <div className={`summary-value ${isPositive ? 'positive' : 'negative'}`}>
            {formatRupee(currentValue)}
            {change !== 0 && (
              <span className="summary-change">
                {isPositive ? '▲' : '▼'} {formatRupee(Math.abs(change))} ({percentChange.toFixed(2)}%)
              </span>
            )}
          </div>
          <div className="summary-timerange">
            {data.length > 1 && (
              <span>
                {formatDate(data[0]?.isoDate || data[0]?.date)} - {formatDate(data[data.length-1]?.isoDate || data[data.length-1]?.date)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render crosshair components
  const renderCrosshair = () => {
    if (!crosshairValues) return null;
    
    const { x, y } = crosshairValues;
    
    return (
      <div className="chart-crosshair-container">
        <div 
          className="chart-crosshair-vertical" 
          style={{ left: `${x}px` }}
        />
        <div 
          className="chart-crosshair-horizontal" 
          style={{ top: `${y}px` }}
        />
      </div>
    );
  };

  return (
    <div className="portfolio-chart" ref={chartContainerRef}>
      <div className="chart-header">
        <h3>Portfolio Performance</h3>
        
        <div className="chart-controls">
          <div className="time-selector">
            {timeRangeOptions.map(option => (
              <button 
                key={option.id}
                className={timeRange === option.id ? 'active' : ''} 
                onClick={() => setTimeRange(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="chart-type-selector">
            <button 
              className={chartType === 'line' ? 'active' : ''} 
              onClick={() => setChartType('line')}
              title="Line Chart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
                <path fill="currentColor" d="M1.5 14h13v1h-13v-1zm1.072-5.709l2.785-2.785 2.116 2.117 5.602-5.603 1.06 1.06-6.662 6.662-2.116-2.117-1.724 1.725-1.06-1.06z"></path>
              </svg>
            </button>
            <button 
              className={chartType === 'area' ? 'active' : ''} 
              onClick={() => setChartType('area')}
              title="Area Chart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
                <path fill="currentColor" d="M1.5 14h13v1h-13v-1zm0-4.5v4h13v-4l-5-6-3 4-2-1.5-3 3.5z"></path>
              </svg>
            </button>
            <button 
              className={chartType === 'bar' ? 'active' : ''} 
              onClick={() => setChartType('bar')}
              title="Bar Chart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
                <path fill="currentColor" d="M1.5 14h13v1h-13v-1zm1-13h2v10h-2v-10zm5 3h2v7h-2v-7zm5 3h2v4h-2v-4z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {renderSummaryBar()}
      
      {loading ? (
        <div className="chart-loading">
          <div className="chart-spinner"></div>
          <div>Loading portfolio data...</div>
        </div>
      ) : (
        <>
          {data.length > 1 ? (
            <div className="chart-container">
              {/* Fixed: Using direct chart rendering instead of ResponsiveContainer with fixed dimensions */}
              {renderChart()}
            </div>
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