import { useState, useRef, useEffect } from 'react';
import {
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Bar, Line, Scatter, ReferenceLine, Area,
  Brush, Label, BarChart
} from 'recharts';
import './TradingViewChart.css';

const TradingViewChart = ({ 
  data = [], 
  symbolName = 'Stock', 
  symbolCode = '',
  onTimeRangeChange = () => {},
  height = 450
}) => {
  const [timeRange, setTimeRange] = useState('1d');
  const [chartType, setChartType] = useState('candle');
  const [hoverData, setHoverData] = useState(null);
  const [crosshairValues, setCrosshairValues] = useState(null);
  const [theme, setTheme] = useState('light');
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [showVolume, setShowVolume] = useState(true);
  const [showMA, setShowMA] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [MA1Period, setMA1Period] = useState(20);
  const [MA2Period, setMA2Period] = useState(50);
  const [studyHeight, setStudyHeight] = useState(80);
  
  // Time frame options
  const timeRangeOptions = [
    { id: '1d', label: '1D' },
    { id: '1w', label: '1W' },
    { id: '1m', label: '1M' },
    { id: '3m', label: '3M' },
    { id: '6m', label: '6M' },
    { id: '1y', label: '1Y' },
    { id: '5y', label: '5Y' },
    { id: 'max', label: 'MAX' }
  ];
  
  // Chart type options
  const chartTypeOptions = [
    { id: 'candle', label: 'Candle', icon: 'candle' },
    { id: 'line', label: 'Line', icon: 'line' },
    { id: 'area', label: 'Area', icon: 'area' },
    { id: 'bar', label: 'Bar', icon: 'bar' }
  ];
  
  // Handle time range changes
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    onTimeRangeChange(range);
  };
  
  // Format price with appropriate decimal places
  const formatPrice = (value) => {
    if (!value && value !== 0) return '';
    const numValue = Number(value);
    
    if (numValue >= 1000) {
      return numValue.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    } else if (numValue >= 100) {
      return numValue.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    } else if (numValue >= 10) {
      return numValue.toLocaleString('en-IN', { maximumFractionDigits: 3 });
    } else {
      return numValue.toLocaleString('en-IN', { maximumFractionDigits: 4 });
    }
  };
  
  // Format large numbers with appropriate Indian units
  const formatLargeNumber = (value) => {
    if (!value && value !== 0) return '';
    const numValue = Number(value);
    
    if (numValue >= 10000000) {
      return `${(numValue / 10000000).toFixed(2)} Cr`;
    } else if (numValue >= 100000) {
      return `${(numValue / 100000).toFixed(2)} L`;
    } else if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(1)}K`;
    } else {
      return numValue.toLocaleString('en-IN');
    }
  };
  
  // Format X-axis based on time range
  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    
    if (typeof tickItem === 'string' && tickItem.includes(':')) {
      // For intraday - show time
      return tickItem;
    }
    
    const date = new Date(tickItem);
    if (isNaN(date.getTime())) return tickItem;
    
    switch (timeRange) {
      case '1d':
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      case '1w':
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
      case '1m':
        return date.getDate(); // Just the day
      case '3m':
      case '6m':
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      case '1y':
        return date.toLocaleDateString('en-IN', { month: 'short' });
      case '5y':
      case 'max':
        return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }
  };
  
  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  // Calculate moving averages for the chart
  const calculateMovingAverage = (period) => {
    if (!data || data.length === 0 || !period || period <= 0) return null;
    
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, [`ma${period}`]: null };
      
      let sum = 0;
      for (let i = 0; i < period; i++) {
        sum += data[index - i].close;
      }
      return { ...item, [`ma${period}`]: sum / period };
    });
  };
  
  // Calculate study data (e.g., volumes)
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Add moving averages to data
    if (showMA) {
      const dataWithMA1 = calculateMovingAverage(MA1Period);
      const dataWithBothMA = dataWithMA1.map((item, index) => {
        const ma2Value = index < MA2Period - 1 ? null : 
          data.slice(index - MA2Period + 1, index + 1).reduce((sum, d) => sum + d.close, 0) / MA2Period;
        
        return { ...item, [`ma${MA2Period}`]: ma2Value };
      });
      
      // Replace the data with the modified one
      // Note: In a real app, you'd want to avoid modifying the original data directly
    }
  }, [data, showMA, MA1Period, MA2Period]);
  
  // Handle mouse movement for tooltips
  const handleMouseMove = (e) => {
    if (e && e.activePayload && e.activePayload.length) {
      setHoverData(e.activePayload[0].payload);
      setCrosshairValues({
        x: e.activeCoordinate.x,
        y: e.activeCoordinate.y
      });
    }
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoverData(null);
    setCrosshairValues(null);
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className={`tv-chart-tooltip ${theme}`}>
          <div className="tv-tooltip-date">{data.date}</div>
          <div className="tv-tooltip-price-section">
            <div className="tv-tooltip-item">
              <span className="tv-tooltip-label">O:</span>
              <span className="tv-tooltip-value">{formatPrice(data.open)}</span>
            </div>
            <div className="tv-tooltip-item">
              <span className="tv-tooltip-label">H:</span>
              <span className="tv-tooltip-value">{formatPrice(data.high)}</span>
            </div>
            <div className="tv-tooltip-item">
              <span className="tv-tooltip-label">L:</span>
              <span className="tv-tooltip-value">{formatPrice(data.low)}</span>
            </div>
            <div className="tv-tooltip-item">
              <span className="tv-tooltip-label">C:</span>
              <span className="tv-tooltip-value">{formatPrice(data.close)}</span>
            </div>
          </div>
          
          {data.volume && (
            <div className="tv-tooltip-item">
              <span className="tv-tooltip-label">Vol:</span>
              <span className="tv-tooltip-value">{formatLargeNumber(data.volume)}</span>
            </div>
          )}
          
          {data.ma20 && (
            <div className="tv-tooltip-item">
              <span className="tv-tooltip-label" style={{ color: '#2962FF' }}>MA20:</span>
              <span className="tv-tooltip-value">{formatPrice(data.ma20)}</span>
            </div>
          )}
          
          {data.ma50 && (
            <div className="tv-tooltip-item">
              <span className="tv-tooltip-label" style={{ color: '#FF6D00' }}>MA50:</span>
              <span className="tv-tooltip-value">{formatPrice(data.ma50)}</span>
            </div>
          )}
          
          {data.percentChange && (
            <div className={`tv-tooltip-change ${data.percentChange >= 0 ? 'positive' : 'negative'}`}>
              {data.percentChange >= 0 ? '+' : ''}{data.percentChange.toFixed(2)}%
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  // Render crosshair
  const renderCrosshair = () => {
    if (!crosshairValues || !containerRef.current) return null;
    
    const { x, y } = crosshairValues;
    const bounds = containerRef.current.getBoundingClientRect();
    
    // Find closest data point to display in the axis labels
    const hoveredPrice = hoverData ? (chartType === 'candle' || chartType === 'bar' ? 
      hoverData.close : hoverData.value) : null;
    
    return (
      <div className="tv-crosshair-container">
        <div className="tv-crosshair-vertical" style={{ left: `${x}px` }}>
          <div className="tv-crosshair-label price-label" style={{ top: `${y}px` }}>
            {formatPrice(hoveredPrice)}
          </div>
        </div>
        <div className="tv-crosshair-horizontal" style={{ top: `${y}px` }}>
          <div className="tv-crosshair-label time-label" style={{ left: `${bounds.width - 70}px` }}>
            {hoverData?.date || ''}
          </div>
        </div>
      </div>
    );
  };
  
  // Custom Y axis tick formatter
  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value;
  };
  
  // Render price chart
  const renderPriceChart = () => {
    const chartHeight = height - (showVolume ? studyHeight : 0);
    
    // Determine chart colors
    const upColor = theme === 'dark' ? '#26A69A' : '#26A69A'; // Green
    const downColor = theme === 'dark' ? '#EF5350' : '#EF5350'; // Red
    const neutralColor = theme === 'dark' ? '#B2B5BE' : '#9B9B9B';
    const gridColor = theme === 'dark' ? '#363A45' : '#F0F3FA';
    const textColor = theme === 'dark' ? '#D1D4DC' : '#58606E';
    const axisColor = theme === 'dark' ? '#363A45' : '#E0E3EB';
    
    // Style for defs pattern
    const candlePatternId = 'candle-pattern';
    
    const isPositive = (d) => d.close >= d.open;
    
    // Reference price (starting price or previous close)
    const referencePrice = data.length > 0 ? data[0].open : null;
    
    switch (chartType) {
      case 'candle':
        return (
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            barCategoryGap={2}
            height={chartHeight}
          >
            {showGrid && <CartesianGrid stroke={gridColor} vertical={false} strokeDasharray="3 3" />}
            
            <XAxis 
              dataKey="date" 
              axisLine={{ stroke: axisColor }}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 11 }}
              tickFormatter={formatXAxis}
              height={20}
            />
            
            <YAxis 
              domain={['auto', 'auto']}
              orientation="right"
              axisLine={false}
              tickLine={false}
              tickFormatter={formatPrice}
              tick={{ fill: textColor, fontSize: 11 }}
              width={55}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Candle wicks (high-low lines) */}
            <Bar
              dataKey="high"
              barSize={6}
              fill="transparent"
              stroke="transparent"
              yAxisId={0}
            >
              {data.map((entry, index) => (
                <rect
                  key={`wick-${index}`}
                  x={0}
                  y={0}
                  width={1}
                  height={1}
                  fill="transparent"
                  stroke={isPositive(entry) ? upColor : downColor}
                  strokeWidth={1}
                />
              ))}
            </Bar>
            
            {/* Candle body - Up candles */}
            <Bar
              dataKey={(d) => isPositive(d) ? Math.abs(d.close - d.open) : 0}
              barSize={8}
              fill={upColor}
              stroke={upColor}
              yAxisId={0}
              stackId="candle"
              fillOpacity={1}
              baseline={(d) => d.open}
            />
            
            {/* Candle body - Down candles */}
            <Bar
              dataKey={(d) => !isPositive(d) ? Math.abs(d.open - d.close) : 0}
              barSize={8}
              fill={downColor}
              stroke={downColor}
              yAxisId={0}
              stackId="candle"
              fillOpacity={1}
              baseline={(d) => d.close}
            />
            
            {/* High-low lines (wicks) for up candles */}
            <Line
              dataKey={(d) => isPositive(d) ? [d.low, d.high] : null}
              stroke={upColor}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              strokeWidth={1}
              connectNulls={false}
              yAxisId={0}
            />
            
            {/* High-low lines (wicks) for down candles */}
            <Line
              dataKey={(d) => !isPositive(d) ? [d.low, d.high] : null}
              stroke={downColor}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              strokeWidth={1}
              connectNulls={false}
              yAxisId={0}
            />
            
            {/* Moving Averages */}
            {showMA && (
              <>
                <Line
                  type="monotone"
                  dataKey={`ma${MA1Period}`}
                  stroke="#2962FF" // Blue
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                  connectNulls={true}
                  yAxisId={0}
                  name={`MA ${MA1Period}`}
                />
                <Line
                  type="monotone"
                  dataKey={`ma${MA2Period}`}
                  stroke="#FF6D00" // Orange
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                  connectNulls={true}
                  yAxisId={0}
                  name={`MA ${MA2Period}`}
                />
              </>
            )}
            
            {/* Reference line (starting price) */}
            {referencePrice && (
              <ReferenceLine
                y={referencePrice}
                stroke={axisColor}
                strokeDasharray="3 3"
              >
                <Label
                  value={formatPrice(referencePrice)}
                  position="insideRight"
                  fill={textColor}
                  fontSize={10}
                />
              </ReferenceLine>
            )}
            
            <Legend verticalAlign="top" height={20} />
          </ComposedChart>
        );
        
      case 'line':
        return (
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            height={chartHeight}
          >
            {showGrid && <CartesianGrid stroke={gridColor} vertical={false} strokeDasharray="3 3" />}
            
            <XAxis 
              dataKey="date" 
              axisLine={{ stroke: axisColor }}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 11 }}
              tickFormatter={formatXAxis}
              height={20}
            />
            
            <YAxis 
              domain={['auto', 'auto']}
              orientation="right"
              axisLine={false}
              tickLine={false}
              tickFormatter={formatPrice}
              tick={{ fill: textColor, fontSize: 11 }}
              width={55}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Line
              type="monotone"
              dataKey="close"
              stroke={neutralColor}
              dot={false}
              strokeWidth={2}
              name={symbolName}
            />
            
            {/* Moving Averages */}
            {showMA && (
              <>
                <Line
                  type="monotone"
                  dataKey={`ma${MA1Period}`}
                  stroke="#2962FF" // Blue
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                  connectNulls={true}
                  name={`MA ${MA1Period}`}
                />
                <Line
                  type="monotone"
                  dataKey={`ma${MA2Period}`}
                  stroke="#FF6D00" // Orange
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                  connectNulls={true}
                  name={`MA ${MA2Period}`}
                />
              </>
            )}
            
            {/* Reference line (starting price) */}
            {referencePrice && (
              <ReferenceLine
                y={referencePrice}
                stroke={axisColor}
                strokeDasharray="3 3"
              >
                <Label
                  value={formatPrice(referencePrice)}
                  position="insideRight"
                  fill={textColor}
                  fontSize={10}
                />
              </ReferenceLine>
            )}
            
            <Legend verticalAlign="top" height={20} />
          </ComposedChart>
        );
        
      case 'area':
        return (
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            height={chartHeight}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#1E88E5" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            {showGrid && <CartesianGrid stroke={gridColor} vertical={false} strokeDasharray="3 3" />}
            
            <XAxis 
              dataKey="date" 
              axisLine={{ stroke: axisColor }}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 11 }}
              tickFormatter={formatXAxis}
              height={20}
            />
            
            <YAxis 
              domain={['auto', 'auto']}
              orientation="right"
              axisLine={false}
              tickLine={false}
              tickFormatter={formatPrice}
              tick={{ fill: textColor, fontSize: 11 }}
              width={55}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="close"
              stroke="#1E88E5"
              fillOpacity={1}
              fill="url(#colorGradient)"
              strokeWidth={2}
              name={symbolName}
            />
            
            {/* Moving Averages */}
            {showMA && (
              <>
                <Line
                  type="monotone"
                  dataKey={`ma${MA1Period}`}
                  stroke="#2962FF" // Blue
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                  connectNulls={true}
                  name={`MA ${MA1Period}`}
                />
                <Line
                  type="monotone"
                  dataKey={`ma${MA2Period}`}
                  stroke="#FF6D00" // Orange
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                  connectNulls={true}
                  name={`MA ${MA2Period}`}
                />
              </>
            )}
            
            {/* Reference line (starting price) */}
            {referencePrice && (
              <ReferenceLine
                y={referencePrice}
                stroke={axisColor}
                strokeDasharray="3 3"
              >
                <Label
                  value={formatPrice(referencePrice)}
                  position="insideRight"
                  fill={textColor}
                  fontSize={10}
                />
              </ReferenceLine>
            )}
            
            <Legend verticalAlign="top" height={20} />
          </ComposedChart>
        );
        
      case 'bar':
        return (
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            barCategoryGap={1}
            height={chartHeight}
          >
            {showGrid && <CartesianGrid stroke={gridColor} vertical={false} strokeDasharray="3 3" />}
            
            <XAxis 
              dataKey="date" 
              axisLine={{ stroke: axisColor }}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 11 }}
              tickFormatter={formatXAxis}
              height={20}
            />
            
            <YAxis 
              domain={['auto', 'auto']}
              orientation="right"
              axisLine={false}
              tickLine={false}
              tickFormatter={formatPrice}
              tick={{ fill: textColor, fontSize: 11 }}
              width={55}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Up bars */}
            <Bar
              dataKey={(d) => isPositive(d) ? d.close : null}
              name="Up"
              fill={upColor}
              stroke={upColor}
              barSize={6}
            />
            
            {/* Down bars */}
            <Bar
              dataKey={(d) => !isPositive(d) ? d.close : null}
              name="Down"
              fill={downColor}
              stroke={downColor}
              barSize={6}
            />
            
            {/* Moving Averages */}
            {showMA && (
              <>
                <Line
                  type="monotone"
                  dataKey={`ma${MA1Period}`}
                  stroke="#2962FF" // Blue
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                  connectNulls={true}
                  name={`MA ${MA1Period}`}
                />
                <Line
                  type="monotone"
                  dataKey={`ma${MA2Period}`}
                  stroke="#FF6D00" // Orange
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                  connectNulls={true}
                  name={`MA ${MA2Period}`}
                />
              </>
            )}
            
            {/* Reference line (starting price) */}
            {referencePrice && (
              <ReferenceLine
                y={referencePrice}
                stroke={axisColor}
                strokeDasharray="3 3"
              >
                <Label
                  value={formatPrice(referencePrice)}
                  position="insideRight"
                  fill={textColor}
                  fontSize={10}
                />
              </ReferenceLine>
            )}
            
            <Legend verticalAlign="top" height={20} />
          </ComposedChart>
        );
        
      default:
        return null;
    }
  };
  
  // Render volume chart
  const renderVolumeChart = () => {
    if (!showVolume) return null;
    
    // Determine chart colors
    const upColor = theme === 'dark' ? '#26A69A' : '#26A69A'; // Green
    const downColor = theme === 'dark' ? '#EF5350' : '#EF5350'; // Red
    const gridColor = theme === 'dark' ? '#363A45' : '#F0F3FA';
    const textColor = theme === 'dark' ? '#D1D4DC' : '#58606E';
    const axisColor = theme === 'dark' ? '#363A45' : '#E0E3EB';
    
    // Function to determine if a candle is positive (close >= open)
    const isPositive = (d) => d.close >= d.open;
    
    return (
      <BarChart
        data={data}
        margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
        height={studyHeight}
        barCategoryGap={2}
      >
        {showGrid && <CartesianGrid stroke={gridColor} vertical={false} strokeDasharray="3 3" />}
        
        <XAxis 
          dataKey="date" 
          axisLine={{ stroke: axisColor }}
          tickLine={false}
          tick={{ fill: textColor, fontSize: 11 }}
          tickFormatter={formatXAxis}
          height={0}
          hide
        />
        
        <YAxis 
          domain={['auto', 'auto']}
          orientation="right"
          axisLine={false}
          tickLine={false}
          tickFormatter={formatYAxis}
          tick={{ fill: textColor, fontSize: 11 }}
          width={55}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        {/* Volume bars */}
        <Bar
          dataKey="volume"
          name="Volume"
          barSize={6}
        >
          {data.map((entry, index) => (
            <rect
              key={`volume-${index}`}
              fill={isPositive(entry) ? upColor : downColor}
              fillOpacity={0.5}
            />
          ))}
        </Bar>
      </BarChart>
    );
  };
  
  // Chart icon components for the toolbar
  const ChartIcons = {
    candle: (
      <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="7" width="4" height="14" fill="currentColor" />
        <rect x="12" y="11" width="4" height="10" fill="currentColor" />
        <rect x="18" y="4" width="4" height="17" fill="currentColor" />
        <line x1="8" y1="4" x2="8" y2="7" stroke="currentColor" strokeWidth="2" />
        <line x1="8" y1="21" x2="8" y2="24" stroke="currentColor" strokeWidth="2" />
        <line x1="14" y1="7" x2="14" y2="11" stroke="currentColor" strokeWidth="2" />
        <line x1="14" y1="21" x2="14" y2="24" stroke="currentColor" strokeWidth="2" />
        <line x1="20" y1="1" x2="20" y2="4" stroke="currentColor" strokeWidth="2" />
        <line x1="20" y1="21" x2="20" y2="27" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    line: (
      <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 19L10 11L18 16L25 7" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    area: (
      <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 19L10 11L18 16L25 7" stroke="currentColor" strokeWidth="2" />
        <path d="M3 19L10 11L18 16L25 7V22H3V19Z" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
    bar: (
      <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="7" width="4" height="14" fill="currentColor" />
        <rect x="12" y="11" width="4" height="10" fill="currentColor" />
        <rect x="18" y="4" width="4" height="17" fill="currentColor" />
      </svg>
    ),
  };
  
  return (
    <div className={`trading-view-chart ${theme}`} ref={containerRef}>
      <div className="tv-chart-header">
        <div className="tv-chart-symbol-info">
          <h3>{symbolName} ({symbolCode})</h3>
        </div>
        
        <div className="tv-chart-controls">
          <div className="tv-time-selector">
            {timeRangeOptions.map(option => (
              <button 
                key={option.id}
                className={timeRange === option.id ? 'active' : ''} 
                onClick={() => handleTimeRangeChange(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="tv-chart-type-selector">
            {chartTypeOptions.map(option => (
              <button 
                key={option.id}
                className={chartType === option.id ? 'active' : ''} 
                onClick={() => setChartType(option.id)}
                title={option.label}
              >
                {ChartIcons[option.icon]}
              </button>
            ))}
          </div>
          
          <div className="tv-chart-indicators">
            <button 
              className={showMA ? 'active' : ''} 
              onClick={() => setShowMA(!showMA)}
              title="Moving Averages"
            >
              MA
            </button>
            <button 
              className={showVolume ? 'active' : ''} 
              onClick={() => setShowVolume(!showVolume)}
              title="Volume"
            >
              Vol
            </button>
          </div>
          
          <button 
            className="tv-theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
      
      <div className="tv-chart-container">
        <ResponsiveContainer width="100%" height={height}>
          <div className="tv-chart-wrapper">
            <ResponsiveContainer width="100%" height={height - (showVolume ? studyHeight : 0)}>
              {renderPriceChart()}
            </ResponsiveContainer>
            
            {showVolume && (
              <div className="tv-volume-panel" style={{ height: studyHeight }}>
                <ResponsiveContainer width="100%" height={studyHeight}>
                  {renderVolumeChart()}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </ResponsiveContainer>
        
        {crosshairValues && renderCrosshair()}
      </div>
    </div>
  );
};

export default TradingViewChart;
