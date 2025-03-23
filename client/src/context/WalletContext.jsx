import { createContext, useState, useContext, useEffect, useRef } from 'react'
import axios from 'axios'
import { API_URL } from '../config'
import { toast } from 'react-toastify'
import { AuthContext } from './AuthContext'

export const WalletContext = createContext()

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [transactionPagination, setTransactionPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })
  const [loading, setLoading] = useState(true)
  const { user } = useContext(AuthContext)
  
  // Add refs to track pending requests
  const isFetchingWallet = useRef(false)
  const isFetchingTransactions = useRef(false)
  const initialFetchDone = useRef(false)

  // Fetch wallet when user is authenticated
  useEffect(() => {
    if (user && !initialFetchDone.current) {
      fetchWallet()
      initialFetchDone.current = true
    } else if (!user) {
      setWallet(null)
      setTransactions([])
      setLoading(false)
      initialFetchDone.current = false
    }
  }, [user])

  const fetchWallet = async () => {
    // Prevent duplicate requests
    if (isFetchingWallet.current) return
    
    try {
      isFetchingWallet.current = true
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWallet(res.data)
      
      // Only fetch transactions if they haven't been loaded yet
      if (transactions.length === 0) {
        await fetchTransactions()
      }
    } catch (error) {
      console.error('Error fetching wallet:', error)
      toast.error('Failed to load wallet information')
    } finally {
      setLoading(false)
      isFetchingWallet.current = false
    }
  }

  const fetchTransactions = async (page = 1, limit = 10) => {
    // Don't fetch if a transaction request is already in progress
    if (isFetchingTransactions.current) return []
    
    try {
      isFetchingTransactions.current = true
      const token = localStorage.getItem('token')
      console.log(`Fetching transactions from: ${API_URL}/wallet/transactions?page=${page}&limit=${limit}`)
      const res = await axios.get(`${API_URL}/wallet/transactions?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log("Transaction response:", res.data)
      
      // Handle both old API format (array) and new format (object with transactions array)
      if (Array.isArray(res.data)) {
        // Old API format
        setTransactions(res.data)
        setTransactionPagination({
          page: 1,
          limit: res.data.length,
          total: res.data.length,
          pages: 1
        })
        return res.data
      } else {
        // New API format with pagination
        setTransactions(res.data.transactions || [])
        setTransactionPagination(res.data.pagination || {
          page: 1,
          limit: 10,
          total: (res.data.transactions || []).length,
          pages: 1
        })
        return res.data.transactions || []
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      if (error.request) {
        console.log("Request was sent but no response received", error.request)
      } 
      if (error.response) {
        console.log("Response was received with error", error.response.status, error.response.data)
      }
      toast.error('Failed to load transaction history')
      return []
    } finally {
      isFetchingTransactions.current = false
    }
  }

  const addFunds = async (amount) => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(`${API_URL}/wallet/deposit`, 
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      setWallet(res.data.wallet)
      toast.success(`Successfully added ₹${amount} to your wallet`)
      await fetchTransactions()
      return res.data
    } catch (error) {
      console.error('Error adding funds:', error)
      toast.error(error.response?.data?.error || 'Failed to add funds')
      throw error
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <WalletContext.Provider value={{ 
      wallet, 
      transactions, 
      transactionPagination,
      loading,
      fetchWallet,
      fetchTransactions,
      addFunds,
      formatCurrency
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
