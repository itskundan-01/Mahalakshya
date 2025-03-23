import { useState } from 'react'
import './TransactionFilter.css'

function TransactionFilter({ onApplyFilters }) {
  const [type, setType] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleApplyFilter = () => {
    onApplyFilters({
      type,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    })
  }

  const handleReset = () => {
    setType('all')
    setStartDate('')
    setEndDate('')
    onApplyFilters({
      type: 'all',
      startDate: null,
      endDate: null
    })
  }

  return (
    <div className="transaction-filter">
      <div className="filter-header">
        <h3>Transaction History</h3>
        <button
          className="filter-toggle-btn"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? 'Hide Filters' : 'Show Filters'} 🔍
        </button>
      </div>

      {isFilterOpen && (
        <div className="filter-controls">
          <div className="filter-group">
            <label>Transaction Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div className="filter-actions">
            <button className="filter-apply-btn" onClick={handleApplyFilter}>Apply</button>
            <button className="filter-reset-btn" onClick={handleReset}>Reset</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionFilter
