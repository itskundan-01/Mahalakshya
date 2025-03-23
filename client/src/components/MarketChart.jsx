import { useState, useRef, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine, ComposedChart
} from 'recharts';
import './MarketChart.css';

const MarketChart = ({ 
  data = [], 
  indexName = 'Index', 
  indexId = '',
  onTimeRangeChange = () => {},
  height = 400,
  chartType = 'line',
  showTimeSelector = true // Add this prop to control time selector visibility
}) => {
  const [timeRange, setTimeRange] = useState('1d');
  const [hoverData, setHoverData] = useState(null);
  const chartRef = useRef(null);
  const [crosshairValues, setCrosshairValues] = useState(null);
  
  // Time frame options - Added more options
  const timeRangeOptions = [
    { id: '1d', label: '1D' },
    { id: '1w', label: '1W' },
    { id: '1m', label: '1M' },
    { id: '6m', label: '6M' },
    { id: '1y', label: '1Y' },
    { id: '5y', label: '5Y' },
    { id: 'max', label: 'MAX' }
  ];
  
  // Handle time range changes
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    onTimeRangeChange(range);
  };
  
  // Format numbers with commas for Indian notation
  const formatIndianNumber = (value) => {
    return value.toLocaleString('en-IN');
  };
  
  // Get chart color based on trend
  const getChartColor = () => {
    if (data.length <= 1) return "#3498db";  // Changed default color
    const firstValue = data[0]?.value;
    const lastValue = data[data.length - 1]?.value;
    return lastValue >= firstValue ? "#0CA678" : "#E03131";
  };
  
  // Format X-axis based on time range
  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    
    switch (timeRange) {
      case '1d':
        // For 1d, show hours
        return tickItem.includes(':') ? tickItem : '';
      case '1w':
        // For 1w, show weekday
        return tickItem.length <= 3 ? tickItem : '';
      case '1m':
        // For 1m, show day of month
        return tickItem.includes(' ') ? tickItem.split(' ')[0] : '';
      case '6m':
      case '1y':
        // For 6m and 1y, show month
        return tickItem.includes(' ') ? tickItem.split(' ')[1] : tickItem;
      case '5y':
      case 'max':
        // For 5y and max, show year
        const parts = tickItem.split(' ');
        return parts.length > 2 ? parts[2] : tickItem;
      default:
        return tickItem;
    }
  };
  
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
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const currentValue = data.value;
      
      // Calculate change
      let change = 0;
      let percentChange = 0;
      
      if (data.change !== undefined) {
        change = data.change;
        percentChange = data.percentChange;
      } else if (data.previousValue !== undefined) {
        change = currentValue - data.previousValue;
        percentChange = data.previousValue !== 0 
          ? (change / Math.abs(data.previousValue)) * 100 
          : 0;
      }
      
      const isPositive = change >= 0;
      
      return (
        <div className="market-tooltip">
          <p className="tooltip-time">{data.time || data.date}</p>
          <p className="tooltip-value">{formatIndianNumber(currentValue)}</p>
          {change !== 0 && (
            <p className={`tooltip-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '▲' : '▼'} {formatIndianNumber(Math.abs(change))} 
              <span className="tooltip-percent">
                ({Math.abs(percentChange).toFixed(2)}%)
              </span>
            </p>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  // Render crosshair
  const renderCrosshair = () => {
    if (!crosshairValues) return null;
    
    const { x, y } = crosshairValues;
    
    return (
      <div className="market-crosshair-container">
        <div 
          className="market-crosshair-vertical" 
          style={{ left: `${x}px` }}
        />
        <div 
          className="market-crosshair-horizontal" 
          style={{ top: `${y}px` }}
        />
      </div>
    );
  };
  
  // Render summary bar
  const renderSummaryBar = () => {
    if (!data || data.length === 0) return null;
    
    const startValue = data[0]?.value || 0;
    const currentValue = hoverData?.value || data[data.length - 1]?.value || 0;
    
    const change = hoverData?.change || data[data.length - 1]?.change || (currentValue - startValue);
    const percentChange = hoverData?.percentChange || data[data.length - 1]?.percentChange || 
      (startValue !== 0 ? (change / Math.abs(startValue)) * 100 : 0);
      
    const isPositive = change >= 0;
    
    return (
      <div className="market-summary-bar">
        <div className={`summary-value ${isPositive ? 'positive' : 'negative'}`}>
          {formatIndianNumber(currentValue)}
          {change !== 0 && (
            <span className="summary-change">
              {isPositive ? '▲' : '▼'} {formatIndianNumber(Math.abs(change))} ({Math.abs(percentChange).toFixed(2)}%)
            </span>
          )}
        </div>
      </div>
    );
  };
  
  // Render chart component
  const renderChart = () => {
    const chartColor = getChartColor();
    
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#666', fontSize: 11 }}
            tickFormatter={formatXAxis}
          />
          <YAxis 
            domain={['auto', 'auto']}
            axisLine={false} 
            tickLine={false}
            tickFormatter={formatIndianNumber}
            tick={{ fill: '#666', fontSize: 11 }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          {chartType === 'line' ? (
            <Line
              type="monotone"
              dataKey="value"
              name={indexName || 'Value'}
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8, fill: 'white', stroke: chartColor, strokeWidth: 2 }}
            />
          ) : (
            <Area
              type="monotone"
              dataKey="value"
              name={indexName || 'Value'}
              stroke={chartColor}
              fill={`url(#color${indexId || 'default'})`}
              fillOpacity={0.3}
              strokeWidth={2}
              activeDot={{ r: 8, fill: 'white', stroke: chartColor, strokeWidth: 2 }}
            />
          )}
          <ReferenceLine 
            y={data[0]?.value} 
            stroke="#666" 
            strokeDasharray="3 3" 
            strokeOpacity={0.5} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <div className="market-chart">
      <div className="market-chart-header">
        <h3>{indexName} Chart</h3>
        
        <div className="chart-controls">
          {/* Only show time selector if showTimeSelector is true */}
          {showTimeSelector && (
            <div className="time-selector">
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
          )}
          
          {/* Added chart type selector */}
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
          </div>
        </div>
      </div>
      
      {renderSummaryBar()}
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
        {crosshairValues && renderCrosshair()}
      </div>
    </div>
  );
};

export default MarketChart;
