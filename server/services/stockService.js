// filepath: /server/services/stockService.js
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY

export const getRealTimePrice = async (symbol) => {
  const response = await axios.get(`https://www.alphavantage.co/query`, {
    params: {
      function: 'GLOBAL_QUOTE',
      symbol,
      apikey: API_KEY,
    },
  })
  return response.data['Global Quote']
}