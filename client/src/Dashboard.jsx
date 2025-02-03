import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <nav>
        <ul>
          <li><Link to="/portfolio">Portfolio</Link></li>
          <li><Link to="/stock-price">Stock Price</Link></li>
          <li><Link to="/trade">Trade</Link></li>
          <li><Link to="/2fa-setup">Two-Factor Authentication</Link></li>
          {/* Add more navigation links as needed */}
        </ul>
      </nav>
      {/* Add dashboard content here */}
    </div>
  );
}

export default Dashboard;