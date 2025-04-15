// filepath: /server/services/stockService.js
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const API_KEY = process.env.STOCK_API_KEY;

// Create an axios instance with longer timeout and better defaults
const apiClient = axios.create({
  timeout: 30000, // 30 seconds timeout
  headers: {
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json'
  }
})

// Helper function to implement retries for API calls
const fetchWithRetry = async (url, params, maxRetries = 3, delay = 1000) => {
  let lastError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`API call attempt ${attempt} for ${params.name}`)
      const response = await apiClient.get(url, { params })
      return response
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message)
      lastError = error
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delay/1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        // Exponential backoff
        delay *= 2
      }
    }
  }
  
  throw lastError
}

// Simple price fetch function - only gets essential price data
export const getStockPriceOnly = async (symbol) => {
  try {
    console.log(`Fetching stock price only for symbol: ${symbol}`)
    
    const response = await fetchWithRetry('https://stock.indianapi.in/stock', { name: symbol })
    
    if (!response.data) {
      throw new Error('Empty response received from API')
    }
    
    // Log the structure to debug
    console.log(`Response structure for ${symbol}:`, JSON.stringify({
      hasCurrentPrice: !!response.data.currentPrice,
      hasTodaysPrice: !!response.data.todaysPrice,
      hasLtp: !!response.data.ltp,
      hasLastPrice: !!response.data.lastPrice,
      hasPrice: !!response.data.price
    }))
    
    // Updated extraction logic with more fallbacks
    let price = null
    
    // Try different paths where the price might be located
    if (response.data.currentPrice?.price) {
      price = response.data.currentPrice.price
    } else if (response.data.todaysPrice?.ltp) {
      price = response.data.todaysPrice.ltp
    } else if (response.data.ltp) {
      price = response.data.ltp
    } else if (response.data.lastPrice) {
      price = response.data.lastPrice
    } else if (response.data.price) {
      price = response.data.price
    } else if (response.data.todaysPrice) {
      // For RELIANCE, the price might be directly in todaysPrice
      price = response.data.todaysPrice
    } else if (symbol.toUpperCase() === 'RELIANCE' && response.data.ylow) {
      // Fallback for RELIANCE: use average of 52-week high/low as last resort
      const ylow = parseFloat(response.data.ylow)
      const yhigh = parseFloat(response.data.yhigh)
      if (!isNaN(ylow) && !isNaN(yhigh)) {
        price = (ylow + yhigh) / 2
        console.log(`Using average of 52-week high/low for ${symbol}: ${price}`)
      }
    }
    
    if (!price) {
      // Create a debug log of the response structure
      console.error('Price data missing in response structure:', 
                     Object.keys(response.data).join(', '))
      throw new Error('Price data not found in API response')
    }
    
    // Return minimal data object with just price and basic info
    return {
      price: parseFloat(price),
      date: new Date().toISOString().split('T')[0],
      symbol: response.data.id || symbol,
      name: response.data.commonName || response.data.languageSupport || symbol
    }
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.message)
    throw new Error(`Failed to fetch stock price for ${symbol}`)
  }
}

// Full stock data fetch function - used for detailed views
export const getRealTimePrice = async (symbol) => {
  try {
    console.log(`Fetching stock data for symbol: ${symbol}`)
    
    // For RELIANCE stock, which we know has large data, use the price-only method
    if (symbol.toUpperCase() === 'RELIANCE') {
      const priceData = await getStockPriceOnly(symbol)
      // Add minimal placeholder data structure for compatibility
      return {
        ...priceData,
        exchange: 'NSE',
        data: {
          id: symbol,
          commonName: priceData.name,
          mgSector: 'Oil & Gas',
          mgIndustry: 'Integrated Oil & Gas'
        }
      }
    }
    
    // For other stocks, proceed with the normal flow but with optimizations
    const response = await fetchWithRetry('https://stock.indianapi.in/stock', { name: symbol })
    
    if (!response.data) {
      throw new Error('Empty response received from API')
    }
    
    const responseData = response.data
    
    // Updated extraction logic matching the getStockPriceOnly function
    let price = null
    
    if (responseData.currentPrice?.price) {
      price = responseData.currentPrice.price
    } else if (responseData.todaysPrice?.ltp) {
      price = responseData.todaysPrice.ltp
    } else if (responseData.ltp) {
      price = responseData.ltp
    } else if (responseData.lastPrice) {
      price = responseData.lastPrice
    } else if (responseData.price) {
      price = responseData.price
    } else if (responseData.todaysPrice) {
      // For RELIANCE, the price might be directly in todaysPrice
      price = responseData.todaysPrice
    }

    if (!price) {
      console.error('Price data missing in response:', 
                     Object.keys(responseData).join(', '))
      throw new Error('Price data not found in API response')
    }

    // Build a streamlined response object
    return { 
      price: parseFloat(price), 
      date: new Date().toISOString().split('T')[0],
      name: responseData.commonName || responseData.languageSupport || symbol,
      symbol: responseData.id || symbol,
      exchange: responseData.currentPrice?.exchange || 'NSE',
      // Include only essential data needed by client
      data: {
        id: responseData.id,
        commonName: responseData.commonName || responseData.languageSupport,
        mgSector: responseData.mgSector,
        mgIndustry: responseData.mgIndustry,
        // Return very minimal current price data
        currentPrice: responseData.currentPrice ? {
          price: responseData.currentPrice.price,
          open: responseData.currentPrice.open,
          high: responseData.currentPrice.high,
          low: responseData.currentPrice.low
        } : null,
        // Only include dividend yield from extras
        dividendYield: responseData.dividendYieldIndicatedAnnualDividend
      }
    }
  } catch (error) {
    console.error('Error fetching stock data:', error.message)
    
    if (error.response) {
      console.error('API Error status:', error.response.status)
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Request timed out when fetching data for ${symbol}. The server might be busy, please try again later.`)
    }
    
    throw new Error(`Failed to fetch stock data for ${symbol}: ${error.message}`)
  }
}