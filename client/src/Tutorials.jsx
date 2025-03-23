import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import './Tutorials.css'

function Tutorials() {
  const [tutorials, setTutorials] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedTutorial, setExpandedTutorial] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sample content focused on Indian market tutorials
  useEffect(() => {
    setLoading(true)
    
    const tutorialsData = [
      { 
        id: 1, 
        title: 'Understanding Indian Stock Market Basics', 
        category: 'beginner',
        description: 'Learn the fundamentals of the Indian stock market, including key exchanges, indices, and trading mechanisms.',
        content: `
          <h4>Introduction to Indian Stock Markets</h4>
          <p>India has two major stock exchanges:</p>
          <ul>
            <li><strong>National Stock Exchange (NSE)</strong> - India's largest stock exchange by trading volume</li>
            <li><strong>Bombay Stock Exchange (BSE)</strong> - Asia's oldest stock exchange, established in 1875</li>
          </ul>
          <p>Key indices that track market performance include:</p>
          <ul>
            <li>NIFTY 50 (NSE's benchmark index comprising 50 large companies)</li>
            <li>SENSEX (BSE's benchmark comprising 30 large companies)</li>
            <li>NIFTY Bank, NIFTY IT, and other sector-specific indices</li>
          </ul>
          <h4>Trading Hours</h4>
          <p>The standard trading session runs from 9:15 AM to 3:30 PM, Monday to Friday (except market holidays).</p>
        `,
        duration: '15 minutes',
        level: 'Beginner'
      },
      { 
        id: 2, 
        title: 'SEBI Regulations for Retail Investors', 
        category: 'beginner',
        description: 'Understand the key regulations set by the Securities and Exchange Board of India (SEBI) that affect retail investors.',
        content: `
          <h4>About SEBI</h4>
          <p>The Securities and Exchange Board of India (SEBI) is the regulatory body for securities and commodity markets in India, established in 1988 and given statutory powers in 1992.</p>
          <h4>Key Regulations</h4>
          <ul>
            <li><strong>Margin Requirements</strong> - For intraday trading and F&O segments</li>
            <li><strong>Circuit Limits</strong> - Price bands to prevent excessive volatility</li>
            <li><strong>Lot Sizes</strong> - Standardized contract sizes for derivatives</li>
            <li><strong>KYC Requirements</strong> - Documentation needed to open trading accounts</li>
          </ul>
        `,
        duration: '20 minutes',
        level: 'Beginner'
      },
      { 
        id: 3, 
        title: 'Demat and Trading Accounts in India', 
        category: 'beginner',
        description: 'Learn about the Demat account system unique to India and how it works with your trading account.',
        content: `
          <h4>Demat Account Structure</h4>
          <p>In India, securities are held electronically in a Dematerialized (Demat) account, which is maintained by depositories like NSDL and CDSL.</p>
          <h4>Account Requirements</h4>
          <ul>
            <li><strong>Demat Account</strong> - For holding securities electronically</li>
            <li><strong>Trading Account</strong> - For executing buy/sell orders</li>
            <li><strong>Bank Account</strong> - Linked for fund transfers</li>
          </ul>
          <h4>3-in-1 Accounts</h4>
          <p>Many brokers offer integrated 3-in-1 accounts that combine Demat, trading and banking services for seamless operations.</p>
        `,
        duration: '18 minutes',
        level: 'Beginner'
      },
      { 
        id: 4, 
        title: 'Technical Analysis for Indian Markets', 
        category: 'intermediate',
        description: 'Apply technical analysis principles specifically to Indian stocks and indices.',
        content: `
          <h4>Technical Indicators for Indian Markets</h4>
          <p>While universal technical analysis principles apply, there are nuances when applying them to Indian markets:</p>
          <ul>
            <li><strong>Volume Analysis</strong> - Understanding F&O expiry effects on volume patterns</li>
            <li><strong>Support/Resistance</strong> - Key psychological levels in Indian indices (Nifty at 20000, 22000, etc.)</li>
            <li><strong>Moving Averages</strong> - The 50-day and 200-day EMAs have shown particular significance</li>
          </ul>
          <h4>Candlestick Patterns</h4>
          <p>Learn how patterns like Doji, Hammer, and Engulfing patterns have performed historically in Nifty and key stocks.</p>
        `,
        duration: '30 minutes',
        level: 'Intermediate'
      },
      { 
        id: 5, 
        title: 'F&O Trading in Indian Markets', 
        category: 'advanced',
        description: 'Master futures and options trading specific to NSE\'s derivative segment.',
        content: `
          <h4>NSE F&O Segment</h4>
          <p>The NSE's F&O segment offers equity derivatives, index derivatives, and currency derivatives.</p>
          <h4>Contract Specifications</h4>
          <ul>
            <li><strong>Lot Sizes</strong> - Understanding standardized contract sizes</li>
            <li><strong>Expiry Cycles</strong> - Weekly and monthly expiry structure</li>
            <li><strong>Settlement</strong> - Cash-settled vs. physically-settled derivatives</li>
          </ul>
          <h4>Option Strategies for Indian Markets</h4>
          <p>Learn strategies that work well in the Indian volatility environment, like Iron Condors during range-bound markets and straddles before major events.</p>
        `,
        duration: '45 minutes',
        level: 'Advanced'
      },
      { 
        id: 6, 
        title: 'IPO Investment Strategy in India', 
        category: 'intermediate',
        description: 'Learn how to analyze and invest in India\'s dynamic IPO market.',
        content: `
          <h4>Indian IPO Process</h4>
          <p>The step-by-step process of an IPO in India from DRHP filing to listing day.</p>
          <h4>IPO Pricing and Valuation</h4>
          <ul>
            <li><strong>Price Band</strong> - Understanding the price range and lot sizes</li>
            <li><strong>Grey Market Premium</strong> - What GMP indicates and its limitations</li>
            <li><strong>Valuation Metrics</strong> - P/E, P/B ratios compared to peers</li>
          </ul>
          <h4>Application Process</h4>
          <p>How to apply through ASBA, UPI mechanism, and the categories (QIB, NII, Retail).</p>
        `,
        duration: '25 minutes',
        level: 'Intermediate'
      },
      { 
        id: 7, 
        title: 'Tax Implications for Indian Traders', 
        category: 'intermediate',
        description: 'Understand the tax structure applicable to various trading and investment activities in India.',
        content: `
          <h4>Capital Gains Tax Structure</h4>
          <p>Different tax rates apply based on holding period:</p>
          <ul>
            <li><strong>Short-term (≤1 year)</strong> - 15% tax on equity and equity mutual funds</li>
            <li><strong>Long-term (>1 year)</strong> - 10% tax on gains exceeding ₹1 lakh per financial year</li>
          </ul>
          <h4>Intraday and F&O Taxation</h4>
          <p>These are considered speculative (intraday) and non-speculative business income (F&O), taxed according to applicable income tax slabs.</p>
        `,
        duration: '22 minutes',
        level: 'Intermediate'
      }
    ];
    
    // Filter tutorials by category if needed
    const filteredTutorials = selectedCategory === 'all' ? 
      tutorialsData : 
      tutorialsData.filter(tutorial => tutorial.category === selectedCategory);
    
    setTutorials(filteredTutorials);
    setTimeout(() => setLoading(false), 600); // Simulate loading delay
    
    toast.info(`Tutorials loaded - ${selectedCategory} category`);
  }, [selectedCategory]);

  const toggleTutorial = (id) => {
    setExpandedTutorial(expandedTutorial === id ? null : id);
  };

  return (
    <div className="tutorials-container">
      <h2>Indian Market Educational Resources</h2>
      <p className="tutorials-intro">
        Learn to navigate the Indian stock market with our curated educational resources
        specifically designed for trading in NSE and BSE.
      </p>
      
      <div className="category-filters">
        <button 
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Tutorials
        </button>
        <button 
          className={`category-btn ${selectedCategory === 'beginner' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('beginner')}
        >
          Beginner
        </button>
        <button 
          className={`category-btn ${selectedCategory === 'intermediate' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('intermediate')}
        >
          Intermediate
        </button>
        <button 
          className={`category-btn ${selectedCategory === 'advanced' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('advanced')}
        >
          Advanced
        </button>
      </div>
      
      {loading ? (
        <div className="tutorials-loading">Loading educational content...</div>
      ) : (
        <div className="tutorials-list">
          {tutorials.map(tutorial => (
            <div 
              key={tutorial.id} 
              className={`tutorial-card ${expandedTutorial === tutorial.id ? 'expanded' : ''}`}
            >
              <div className="tutorial-header" onClick={() => toggleTutorial(tutorial.id)}>
                <h3>{tutorial.title}</h3>
                <div className="tutorial-meta">
                  <span className={`level-badge ${tutorial.category}`}>{tutorial.level}</span>
                  <span className="duration">{tutorial.duration}</span>
                  <span className="expand-icon">{expandedTutorial === tutorial.id ? '−' : '+'}</span>
                </div>
              </div>
              
              <div className="tutorial-description">
                <p>{tutorial.description}</p>
              </div>
              
              {expandedTutorial === tutorial.id && (
                <div className="tutorial-content" dangerouslySetInnerHTML={{ __html: tutorial.content }}></div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="tutorials-resources">
        <h3>Additional Resources</h3>
        <ul>
          <li>
            <a href="https://www.sebi.gov.in/investors/investor-education.html" target="_blank" rel="noopener noreferrer">
              SEBI Investor Education
            </a>
          </li>
          <li>
            <a href="https://www.nseindia.com/learn/content/derivatives-futures-options" target="_blank" rel="noopener noreferrer">
              NSE Derivatives Education
            </a>
          </li>
          <li>
            <a href="https://www.bseindia.com/investors/investor_education.html" target="_blank" rel="noopener noreferrer">
              BSE Investor Education
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Tutorials