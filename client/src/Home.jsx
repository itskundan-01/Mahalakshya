import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div>
      <h1 id='heading'>Welcome To MahaLakshya !!</h1>
      <h4 id='sub-heading'>The Gateway to Your Financial Goals</h4>
      <nav>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </nav>
    </div>
  )
}

export default Home