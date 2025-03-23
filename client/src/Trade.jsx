import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from './config'
import { toast } from 'react-toastify'
import { useWallet } from './context/WalletContext'
import './Trade.css'

function Trade() {
  const [stockSymbol, setStockSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [tradeType, setTradeType] = useState('buy')
  const [exchange, setExchange] = useState('NSE')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { wallet, fetchWallet, formatCurrency } = useWallet()
  const [tradeComplete, setTradeComplete] = useState(false)
  const [tradeDetails, setTradeDetails] = useState(null)

  const popularSymbols = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 
    'HINDUNILVR', 'SBIN', 'BAJFINANCE', 'BHARTIARTL', 'KOTAKBANK'
  ];

  // Fetch wallet on component mount - modify to prevent duplicate fetching
  useEffect(() => {
    // Only fetch if wallet is null
    if (!wallet) {
      fetchWallet()
    }
  }, [fetchWallet, wallet])

  const handleSymbolSelect = (symbol) => {
    setStockSymbol(symbol);
    // Optionally fetch the current price here
    fetchCurrentPrice(symbol);
  };

  const fetchCurrentPrice = async (symbol) => {
    try {
      const res = await axios.get(`${API_URL}/stocks/price/${symbol}`);
      setPrice(res.data.price);
      toast.info(`Current price loaded: ₹${res.data.price}`);
    } catch (err) {
      // Silent fail - don't show error to user
      console.error("Couldn't fetch price automatically");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTradeComplete(false);
    const token = localStorage.getItem('token');
    
    try {
      const totalCost = parseFloat(quantity) * parseFloat(price);
      
      // Check if user has enough funds for buy order
      if (tradeType === 'buy' && wallet && totalCost > wallet.balance) {
        toast.error(`Insufficient funds. You need ₹${totalCost.toFixed(2)} but have ${formatCurrency(wallet.balance)}`);
        setMessage(`Insufficient funds. Required: ₹${totalCost.toFixed(2)}`);
        setLoading(false);
        return;
      }
      
      const endpoint = tradeType === 'buy' ? '/trades/buy' : '/trades/sell';
      const res = await axios.post(`${API_URL}${endpoint}`, 
        { 
          stockSymbol, 
          quantity: parseInt(quantity), 
          price: parseFloat(price),
          exchange
        }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update wallet after trade
      await fetchWallet();
      
      const successMsg = `Trade successful: ${res.data.type} ${res.data.quantity} shares of ${res.data.stockSymbol} @ ₹${res.data.price}`;
      setMessage(successMsg);
      toast.success(successMsg);
      
      // Set trade complete state and details for receipt
      setTradeComplete(true);
      setTradeDetails({
        type: res.data.type,
        stockSymbol: res.data.stockSymbol,
        quantity: res.data.quantity,
        price: res.data.price,
        total: res.data.type === 'buy' ? -totalCost : totalCost,
        walletBalance: res.data.walletBalance,
        date: new Date().toLocaleString('en-IN')
      });
      
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Trade failed';
      setMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setStockSymbol('');
    setQuantity('');
    setPrice('');
    setTradeComplete(false);
    setTradeDetails(null);
    setMessage('');
  }

  const calculateTotal = () => {
    if (quantity && price) {
      return (parseFloat(quantity) * parseFloat(price)).toFixed(2);
    }
    return '0.00';
  }

  return (
    <div className="trade-container">
      <h2>{tradeType === 'buy' ? 'Buy Stock' : 'Sell Stock'}</h2>
      
      {wallet && (
        <div className="wallet-info">
          <span className="wallet-label">Available Balance:</span>
          <span className="wallet-balance">{formatCurrency(wallet.balance)}</span>
        </div>
      )}
      
      {/* Show trade form or receipt based on state */}
      {!tradeComplete ? (
        <>
          <div className="trade-type-selector">
            <button 
              className={`type-btn ${tradeType === 'buy' ? 'active buy' : ''}`}
              onClick={() => setTradeType('buy')}
            >
              BUY
            </button>
            <button 
              className={`type-btn ${tradeType === 'sell' ? 'active sell' : ''}`}
              onClick={() => setTradeType('sell')}
            >
              SELL
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="trade-form">
            <div className="form-group">
              <label>Exchange</label>
              <select 
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                required
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Stock Symbol</label>
              <input 
                type="text" 
                placeholder="e.g., RELIANCE" 
                value={stockSymbol} 
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                required 
              />
            </div>
            
            <div className="popular-symbols">
              {popularSymbols.map(symbol => (
                <button
                  key={symbol}
                  type="button"
                  className="symbol-chip"
                  onClick={() => handleSymbolSelect(symbol)}
                >
                  {symbol}
                </button>
              ))}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input 
                  type="number" 
                  placeholder="No. of Shares" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1" 
                  step="1" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  placeholder="Price per Share" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.05" 
                  required 
                />
              </div>
            </div>
            
            <div className="order-summary">
              <div className="summary-row">
                <span>Total Value:</span>
                <span className="total-value">₹ {calculateTotal()}</span>
              </div>
              
              {tradeType === 'buy' && wallet && (
                <div className="summary-row">
                  <span>Balance After Trade:</span>
                  <span className={`total-value ${parseFloat(calculateTotal()) > wallet.balance ? 'negative' : ''}`}>
                    {formatCurrency(wallet.balance - parseFloat(calculateTotal()))}
                  </span>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className={`submit-btn ${tradeType}`}
              disabled={loading || (tradeType === 'buy' && wallet && parseFloat(calculateTotal()) > wallet.balance)}
            >
              {loading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} Now`}
            </button>
          </form>
        </>
      ) : (
        <div className="trade-receipt">
          <div className="receipt-header">
            <h3>Trade Confirmation</h3>
            <span className={`receipt-type ${tradeDetails?.type}`}>
              {tradeDetails?.type.toUpperCase()}
            </span>
          </div>
          
          <div className="receipt-details">
            <div className="receipt-row">
              <span className="receipt-label">Stock Symbol</span>
              <span className="receipt-value">{tradeDetails?.stockSymbol}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Exchange</span>
              <span className="receipt-value">{exchange}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Quantity</span>
              <span className="receipt-value">{tradeDetails?.quantity} shares</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Price</span>
              <span className="receipt-value">{formatCurrency(tradeDetails?.price)}</span>
            </div>
            <div className="receipt-row total">
              <span className="receipt-label">Total Value</span>
              <span className="receipt-value">{formatCurrency(Math.abs(tradeDetails?.total))}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">New Wallet Balance</span>
              <span className="receipt-value">{formatCurrency(tradeDetails?.walletBalance)}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Transaction Date</span>
              <span className="receipt-value">{tradeDetails?.date}</span>
            </div>
          </div>
          
          <div className="receipt-actions">
            <button className="new-trade-btn" onClick={resetForm}>
              New Trade
            </button>
          </div>
        </div>
      )}
      
      {message && !tradeComplete && <div className={`trade-message ${tradeType}`}>{message}</div>}
      
      <div className="trade-info">
        <h3>Trading Information</h3>
        <p>Trading hours: Monday to Friday, 9:15 AM to 3:30 PM IST</p>
        <p>All trades are executed at market price and may be subject to market risk</p>
        <p>SEBI Registration: XXXXXX | BSE/NSE Member ID: YYYYY</p>
      </div>
    </div>
  )
}

export default Trade