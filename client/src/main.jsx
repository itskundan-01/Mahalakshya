import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Register from './Register'
import Login from './Login'
import Dashboard from './Dashboard'
import Portfolio from './Portfolio'
import StockPrice from './StockPrice'
import TwoFASetup from './TwoFASetup'
import Trade from './Trade'
import Tutorials from './Tutorials'
import MarketNews from './MarketNews'
import Competitions from './Competitions'
import Forum from './Forum'
import AdminPanel from './AdminPanel'
import Wallet from './Wallet'
import Navbar from './Navbar'
import Profile from './Profile'  // Import the Profile component
import Settings from './Settings'  // Import the Settings component
import StockDetails from './pages/StockDetails'  // Add this import
import './main.css'
import { AuthProvider } from './context/AuthContext'
import { WalletProvider } from './context/WalletContext'
import ProtectedRoute from './ProtectedRoute'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WalletProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock-price"
              element={
                <ProtectedRoute>
                  <StockPrice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trade"
              element={
                <ProtectedRoute>
                  <Trade />
                </ProtectedRoute>
              }
            />
            <Route
              path="/2fa-setup"
              element={
                <ProtectedRoute>
                  <TwoFASetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutorials"
              element={
                <ProtectedRoute>
                  <Tutorials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/market-news"
              element={
                <ProtectedRoute>
                  <MarketNews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/competitions"
              element={
                <ProtectedRoute>
                  <Competitions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forum"
              element={
                <ProtectedRoute>
                  <Forum />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/stock/:symbol" 
              element={<StockDetails />}
            />
          </Routes>
          <ToastContainer />
        </WalletProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
