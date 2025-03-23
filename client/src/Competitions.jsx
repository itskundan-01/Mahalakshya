import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import './Competitions.css'

function Competitions() {
  const [leaderboard, setLeaderboard] = useState([])
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCompetition, setActiveCompetition] = useState('nifty')

  useEffect(() => {
    setLoading(true);
    
    // In a real app, fetch this data from an API
    const dummyCompetitions = [
      { 
        id: 'nifty', 
        name: 'NIFTY Trader Challenge', 
        description: 'Compete to achieve the highest returns trading NIFTY derivatives and F&O contracts',
        prize: '₹2,00,000',
        startDate: '2023-10-01',
        endDate: '2023-10-31',
        participants: 752
      },
      { 
        id: 'sensex', 
        name: 'SENSEX Master Cup', 
        description: 'Weekly competition for day traders focused on SENSEX constituents and index futures',
        prize: '₹1,50,000',
        startDate: '2023-10-15',
        endDate: '2023-11-15',
        participants: 603
      },
      { 
        id: 'midcap', 
        name: 'Nifty Midcap 100 Challenge', 
        description: 'Find hidden gems in the midcap segment and build a winning portfolio',
        prize: '₹1,00,000',
        startDate: '2023-09-15',
        endDate: '2023-12-15',
        participants: 489
      },
      { 
        id: 'smallcap', 
        name: 'Small Cap Titans', 
        description: 'Discover tomorrow\'s multibaggers in the small cap universe of BSE & NSE',
        prize: '₹75,000',
        startDate: '2023-10-01',
        endDate: '2023-12-31',
        participants: 352
      }
    ];
    
    const dummyLeaderboards = {
      nifty: [
        { rank: 1, name: 'VijayTrader21', profit: '₹82,500', roi: '+16.5%', city: 'Mumbai' },
        { rank: 2, name: 'NiftyKing', profit: '₹65,200', roi: '+13.0%', city: 'Delhi' },
        { rank: 3, name: 'TradeGuru99', profit: '₹58,750', roi: '+11.8%', city: 'Bengaluru' },
        { rank: 4, name: 'MarketMaster', profit: '₹45,000', roi: '+9.0%', city: 'Chennai' },
        { rank: 5, name: 'BullishVibes', profit: '₹42,300', roi: '+8.5%', city: 'Hyderabad' },
      ],
      sensex: [
        { rank: 1, name: 'StockGuru', profit: '₹54,250', roi: '+10.9%', city: 'Ahmedabad' },
        { rank: 2, name: 'InvestorPro', profit: '₹48,500', roi: '+9.7%', city: 'Pune' },
        { rank: 3, name: 'TradingMaven', profit: '₹41,000', roi: '+8.2%', city: 'Kolkata' },
        { rank: 4, name: 'DalalStreetKing', profit: '₹37,500', roi: '+7.5%', city: 'Mumbai' },
        { rank: 5, name: 'EquityQueen', profit: '₹35,000', roi: '+7.0%', city: 'Bengaluru' },
      ],
      midcap: [
        { rank: 1, name: 'MidcapHunter', profit: '₹65,000', roi: '+13.0%', city: 'Jaipur' },
        { rank: 2, name: 'ValuePicker', profit: '₹57,500', roi: '+11.5%', city: 'Delhi' },
        { rank: 3, name: 'GrowthInvestor', profit: '₹53,000', roi: '+10.6%', city: 'Mumbai' },
        { rank: 4, name: 'SmallcapGuru', profit: '₹46,500', roi: '+9.3%', city: 'Surat' },
        { rank: 5, name: 'EquityHawk', profit: '₹42,000', roi: '+8.4%', city: 'Chennai' },
      ],
      smallcap: [
        { rank: 1, name: 'MultibaggerFinder', profit: '₹92,500', roi: '+18.5%', city: 'Indore' },
        { rank: 2, name: 'CompoundWealth', profit: '₹87,300', roi: '+17.5%', city: 'Lucknow' },
        { rank: 3, name: 'AlphaHunter', profit: '₹76,200', roi: '+15.2%', city: 'Kochi' },
        { rank: 4, name: 'SmallCapQueen', profit: '₹61,000', roi: '+12.2%', city: 'Chandigarh' },
        { rank: 5, name: 'ValueSeeker45', profit: '₹58,750', roi: '+11.8%', city: 'Hyderabad' },
      ]
    };
    
    setCompetitions(dummyCompetitions);
    setLeaderboard(dummyLeaderboards[activeCompetition] || []);
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
    }, 600);
    
    toast.success(`Competition data loaded for ${activeCompetition.toUpperCase()} challenge`);
  }, [activeCompetition]);

  const handleCompetitionChange = (competitionId) => {
    setActiveCompetition(competitionId);
  };

  const getActiveCompetition = () => {
    return competitions.find(comp => comp.id === activeCompetition);
  };

  return (
    <div className="competitions-container">
      <h2>Indian Trading Competitions</h2>
      
      <div className="competitions-tabs">
        {competitions.map(competition => (
          <button 
            key={competition.id}
            className={`competition-tab ${activeCompetition === competition.id ? 'active' : ''}`}
            onClick={() => handleCompetitionChange(competition.id)}
          >
            {competition.name}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="loading-competitions">Loading competition data...</div>
      ) : (
        <>
          <div className="competition-details">
            {getActiveCompetition() && (
              <>
                <h3>{getActiveCompetition().name}</h3>
                <p className="competition-description">{getActiveCompetition().description}</p>
                <div className="competition-meta">
                  <div className="meta-item">
                    <span className="meta-label">Prize Pool</span>
                    <span className="meta-value prize">{getActiveCompetition().prize}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Duration</span>
                    <span className="meta-value">{getActiveCompetition().startDate} to {getActiveCompetition().endDate}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Participants</span>
                    <span className="meta-value">{getActiveCompetition().participants.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="leaderboard-section">
            <h3>Current Leaderboard</h3>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Trader</th>
                  <th>City</th>
                  <th>Profit</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.rank} className={entry.rank <= 3 ? 'top-rank' : ''}>
                    <td className="rank">{entry.rank}</td>
                    <td className="trader-name">{entry.name}</td>
                    <td>{entry.city}</td>
                    <td className="profit">{entry.profit}</td>
                    <td className="roi">{entry.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="join-competition">
            <h3>Join the Competition</h3>
            <p>Register now to participate in our virtual trading competitions and win exciting prizes!</p>
            <button className="join-btn">Register Now</button>
          </div>
          
          <div className="competition-rules">
            <h3>Competition Rules</h3>
            <ul>
              <li>All participants start with a virtual capital of ₹5,00,000</li>
              <li>Trading is limited to Indian market securities listed on NSE/BSE</li>
              <li>Performance is measured by percentage return on investment</li>
              <li>Participants must execute at least 10 trades to qualify for prizes</li>
              <li>Market manipulation and unfair practices will lead to disqualification</li>
              <li>Trading hours follow NSE/BSE timings: 9:15 AM to 3:30 PM IST on working days</li>
              <li>All competition prizes are subject to applicable TDS as per Income Tax regulations</li>
            </ul>
          </div>
        </>
      )}
      
      <div className="past-winners">
        <h3>Past Champions</h3>
        <div className="winner-list">
          <div className="winner-card">
            <div className="winner-month">August 2023</div>
            <div className="winner-name">RajTrader007</div>
            <div className="winner-return">+21.4% ROI</div>
            <div className="winner-prize">Prize: ₹1.5 Lakh</div>
          </div>
          <div className="winner-card">
            <div className="winner-month">July 2023</div>
            <div className="winner-name">BullishHarsh</div>
            <div className="winner-return">+18.9% ROI</div>
            <div className="winner-prize">Prize: ₹1.5 Lakh</div>
          </div>
          <div className="winner-card">
            <div className="winner-month">June 2023</div>
            <div className="winner-name">NiftyCaller</div>
            <div className="winner-return">+23.2% ROI</div>
            <div className="winner-prize">Prize: ₹1.5 Lakh</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Competitions