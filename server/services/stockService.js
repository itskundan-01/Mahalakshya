// filepath: /server/services/stockService.js
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY

export const getRealTimePrice = async (symbol) => {
  const response = await axios.get(`https://www.alphavantage.co/query`, {
    params: {
      function: 'TIME_SERIES_DAILY', // Use TIME_SERIES_DAILY as per your Postman test
      symbol,
      apikey: API_KEY,
    },
  })

  // Parse the latest day's close price
  const timeSeries = response.data['Time Series (Daily)']
  if (!timeSeries) {
    throw new Error('No time series data found')
  }
  const latestDate = Object.keys(timeSeries)[0]
  const latestPrice = timeSeries[latestDate]['4. close']
  return { price: latestPrice, date: latestDate }
}