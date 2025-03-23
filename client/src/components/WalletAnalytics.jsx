import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './WalletAnalytics.css'

function WalletAnalytics() {
  const { transactions, formatCurrency } = useWallet()
  const [balanceHistory, setBalanceHistory] = useState([])
  const [transactionTypes, setTransactionTypes] = useState([])
  const [transactionsPerDay, setTransactionsPerDay] = useState([])
  const [chartType, setChartType] = useState('balance')

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
  const CHART_TYPES = [
    { id: 'balance', name: 'Balance History' },
    { id: 'type', name: 'Transaction Types' },
    { id: 'volume', name: 'Transaction Volume' }
  ]

  useEffect(() => {
    if (transactions.length > 0) {
      processTransactions()
    }
  }, [transactions])

  const processTransactions = () => {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )

    // Generate balance history data
    const history = sortedTransactions.map(t => ({
      date: new Date(t.createdAt).toLocaleDateString('en-IN'),
      balance: t.balanceAfter,
      amount: t.amount,
      type: t.type
    }))
    setBalanceHistory(history)

    // Generate transaction type data
    const typeCount = {}
    sortedTransactions.forEach(t => {
      if (!typeCount[t.type]) typeCount[t.type] = 0
      typeCount[t.type] += 1
    })
    
    const typesData = Object.keys(typeCount).map(type => ({
      type,
      count: typeCount[type],
      value: typeCount[type]  // For PieChart compatibility
    }))
    setTransactionTypes(typesData)

    // Generate transactions per day
    const dayCount = {}
    sortedTransactions.forEach(t => {
      const day = new Date(t.createdAt).toLocaleDateString('en-IN')
      if (!dayCount[day]) dayCount[day] = 0
      dayCount[day] += 1
    })
    
    const daysData = Object.keys(dayCount).map(day => ({
      day,
      count: dayCount[day]
    }))
    setTransactionsPerDay(daysData)
  }

  const renderBalanceChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={balanceHistory}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value).split('.')[0]}
        />
        <Tooltip 
          formatter={(value) => [formatCurrency(value), 'Balance']}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="balance"
          name="Wallet Balance"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderTypeChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={transactionTypes}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="type"
          label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
        >
          {transactionTypes.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, 'Transactions']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )

  const renderVolumeChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={transactionsPerDay}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip formatter={(value) => [value, 'Transactions']} />
        <Legend />
        <Bar dataKey="count" name="Transaction Count" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderSelectedChart = () => {
    if (transactions.length === 0) {
      return <div className="no-data-message">No transaction data available for analytics.</div>
    }
    
    switch (chartType) {
      case 'balance':
        return renderBalanceChart()
      case 'type':
        return renderTypeChart()
      case 'volume':
        return renderVolumeChart()
      default:
        return null
    }
  }

  return (
    <div className="wallet-analytics">
      <div className="analytics-header">
        <h3>Wallet Analytics</h3>
        <div className="chart-selector">
          {CHART_TYPES.map(type => (
            <button
              key={type.id}
              className={`chart-type-btn ${chartType === type.id ? 'active' : ''}`}
              onClick={() => setChartType(type.id)}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container">
        {renderSelectedChart()}
      </div>
    </div>
  )
}

export default WalletAnalytics
