import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_URL } from './config'
import { toast } from 'react-toastify'

function TwoFASetup() {
  const [qrCode, setQrCode] = useState('')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  // Generate QR code on mount
  useEffect(() => {
    const generate2FA = async () => {
      const authToken = localStorage.getItem('token')
      try {
        const res = await axios.get(`${API_URL}/2fa/generate`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
        setQrCode(res.data.qrCode)
        // Notify user that the QR code has been generated
        toast.success('2FA QR code generated. Scan it using an authenticator app.')
      } catch (error) {
        // If 2FA is already set up an error is returned.
        toast.error(error.response?.data?.error || 'Error generating 2FA QR code')
      }
    }
    generate2FA()
  }, [])

  const handleVerify = async () => {
    const authToken = localStorage.getItem('token')
    try {
      const res = await axios.post(`${API_URL}/2fa/verify`, { token: token.trim() }, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      setMessage(res.data.message)
      toast.success(res.data.message)
      // Optionally navigate away after successful 2FA setup.
      navigate('/dashboard')
    } catch (error) {
      setMessage(error.response?.data?.error)
      toast.error(error.response?.data?.error || 'Error verifying token')
    }
  }

  return (
    <div>
      <h2>Enable Two-Factor Authentication</h2>
      {qrCode && <img src={qrCode} alt="2FA QR Code" />}
      <div>
        <input
          type="text"
          placeholder="Enter 2FA Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button onClick={handleVerify}>Verify</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  )
}

export default TwoFASetup