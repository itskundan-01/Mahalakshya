// filepath: /client/src/services/authService.js
import axios from 'axios'
import { API_URL } from '../config'

// Updated to accept an object with name, email, password and phone
export const register = (data) => {
  return axios.post(`${API_URL}/auth/register`, data)
}

export const login = (email, password) => {
  return axios.post(`${API_URL}/auth/login`, { email, password })
}