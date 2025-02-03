import { useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from './services/authService'
import { AuthContext } from './context/AuthContext'
import { toast } from 'react-toastify'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const { setUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await login(email, password)
      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)
      setMessage('Login successful')
      toast.success('Login successful')
      navigate(from, { replace: true })
    } catch (error) {
      const err = error.response?.data?.error || 'Login failed'
      setMessage(err)
      toast.error(err)
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

export default Login