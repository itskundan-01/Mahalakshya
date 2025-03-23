import { useState, useMemo, useRef } from 'react'
import { useWallet } from './context/WalletContext'
import { toast } from 'react-toastify' // Add this line
import WalletAnalytics from './components/WalletAnalytics'
import TransactionFilter from './components/TransactionFilter'
import Pagination from './components/Pagination'
import { exportToCSV, exportToPDF } from './utils/ExportUtils'
import './Wallet.css'

function Wallet() {
  const { wallet, transactions, transactionPagination, loading, addFunds, formatCurrency, fetchTransactions } = useWallet()
  const [depositAmount, setDepositAmount] = useState('')
  const [isDepositing, setIsDepositing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: null,
    endDate: null
  })
  const isManualPageChange = useRef(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault()
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      return
    }
    
    setIsDepositing(true)
    try {
      await addFunds(depositAmount)
      setDepositAmount('')
    } finally {
      setIsDepositing(false)
    }
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return '💰'
      case 'withdrawal': return '💸'
      case 'buy': return '📉'
      case 'sell': return '📈'
      default: return '🔄'
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'sell':
        return 'positive'
      case 'withdrawal':
      case 'buy':
        return 'negative'
      default:
        return ''
    }
  }

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filter by type
      if (filters.type !== 'all' && transaction.type !== filters.type) {
        return false
      }
      
      // Filter by start date
      if (filters.startDate && new Date(transaction.createdAt) < filters.startDate) {
        return false
      }
      
      // Filter by end date
      if (filters.endDate) {
        const endDateWithTime = new Date(filters.endDate)
        endDateWithTime.setHours(23, 59, 59, 999) // Set to end of day
        if (new Date(transaction.createdAt) > endDateWithTime) {
          return false
        }
      }
      
      return true
    })
  }, [transactions, filters])

  // Handle page change for transaction history
  const handlePageChange = (page) => {
    isManualPageChange.current = true;
    fetchTransactions(page).finally(() => {
      isManualPageChange.current = false;
    });
  };

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      exportToCSV(transactions, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Transactions exported to CSV');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export transactions');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportToPDF(
        transactions, 
        formatCurrency,
        `transactions_${new Date().toISOString().split('T')[0]}.pdf`
      );
      toast.success('Transactions exported to PDF');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export transactions');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <div className="wallet-loading">Loading wallet information...</div>
  }

  return (
    <div className="wallet-container">
      <h2>Virtual Trading Wallet</h2>
      
      <div className="wallet-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'deposit' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposit')}
        >
          Add Funds
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>
      
      {activeTab === 'overview' && (
        <div className="wallet-overview">
          <div className="balance-card">
            <div className="balance-label">Current Balance</div>
            <div className="balance-amount">{formatCurrency(wallet?.balance || 0)}</div>
          </div>
          
          <div className="wallet-stats">
            <div className="stat-card">
              <div className="stat-label">Buying Power</div>
              <div className="stat-value">{formatCurrency(wallet?.balance || 0)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Deposits</div>
              <div className="stat-value">
                {formatCurrency(transactions
                  .filter(t => t.type === 'deposit')
                  .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Last Transaction</div>
              <div className="stat-value">
                {transactions.length > 0 
                  ? new Date(transactions[0].createdAt).toLocaleDateString('en-IN')
                  : 'No transactions yet'}
              </div>
            </div>
          </div>
          
          <h3>Recent Activity</h3>
          <div className="recent-transactions">
            {transactions.length > 0 ? (
              transactions.slice(0, 5).map((transaction) => (
                <div key={transaction._id} className={`transaction-item ${getTransactionColor(transaction.type)}`}>
                  <div className="transaction-icon">{getTransactionIcon(transaction.type)}</div>
                  <div className="transaction-details">
                    <div className="transaction-description">{transaction.description}</div>
                    <div className="transaction-date">
                      {new Date(transaction.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div className="transaction-amount">
                    {transaction.amount > 0 ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-transactions">
                No recent transactions. Start by adding funds to your wallet.
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'deposit' && (
        <div className="wallet-deposit">
          <div className="deposit-info">
            <h3>Add Virtual Funds</h3>
            <p>
              This is a virtual trading platform. Add virtual funds to trade stocks in the simulated market environment.
              No real money is involved.
            </p>
          </div>
          
          <form className="deposit-form" onSubmit={handleDeposit}>
            <div className="form-group">
              <label htmlFor="amount">Amount (₹)</label>
              <input
                type="number"
                id="amount"
                min="1000"
                step="1000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount (Min. ₹1,000)"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="deposit-btn" 
              disabled={isDepositing || !depositAmount}
            >
              {isDepositing ? 'Processing...' : 'Add Funds'}
            </button>
          </form>
          
          <div className="deposit-notes">
            <p>Note:</p>
            <ul>
              <li>Virtual funds are for simulation purposes only</li>
              <li>You can add funds as needed to practice trading</li>
              <li>All trades are executed using these virtual funds</li>
            </ul>
          </div>
        </div>
      )}
      
      {activeTab === 'transactions' && (
        <div className="wallet-transactions">
          <div className="transactions-header">
            <TransactionFilter onApplyFilters={setFilters} />
            
            <div className="export-actions">
              <button 
                className="export-btn" 
                onClick={handleExportCSV}
                disabled={isExporting || filteredTransactions.length === 0}
              >
                Export CSV
              </button>
              <button 
                className="export-btn" 
                onClick={handleExportPDF}
                disabled={isExporting || filteredTransactions.length === 0}
              >
                Export PDF
              </button>
            </div>
          </div>
          
          {filteredTransactions.length > 0 ? (
            <>
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className={getTransactionColor(transaction.type)}>
                      <td>{new Date(transaction.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>{transaction.description}</td>
                      <td className="transaction-type">{transaction.type.toUpperCase()}</td>
                      <td className="transaction-amount">
                        {transaction.amount > 0 ? '+' : ''}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td>{formatCurrency(transaction.balanceAfter)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <Pagination 
                currentPage={transactionPagination.page}
                totalPages={transactionPagination.pages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="no-transactions">
              No transactions match your filters. Try adjusting your criteria.
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'analytics' && (
        <div className="wallet-analytics-tab">
          <WalletAnalytics />
        </div>
      )}
    </div>
  )
}

export default Wallet
