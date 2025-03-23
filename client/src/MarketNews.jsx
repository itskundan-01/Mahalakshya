import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import './MarketNews.css'

function MarketNews() {
  const [news, setNews] = useState([])
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true);
    // In a production app, fetch from a real API
    // For now, using static data to demonstrate the UI
    const fetchNews = () => {
      const allNews = [
        { 
          id: 1, 
          category: 'policy', 
          headline: 'RBI Holds Policy Rates Steady for Fourth Consecutive Meeting', 
          details: 'The Reserve Bank of India maintained the repo rate at 6.5%, focusing on inflation control.',
          source: 'Economic Times',
          date: '2023-10-05',
          imageUrl: 'https://example.com/rbi-policy.jpg'
        },
        { 
          id: 2, 
          category: 'sectors', 
          headline: 'IT Sector Faces Pressure as Global Tech Spending Slows', 
          details: 'Major Indian IT firms report cautious outlook as clients reduce tech budgets amid global economic uncertainty.',
          source: 'Business Standard',
          date: '2023-10-04',
          imageUrl: 'https://example.com/it-sector.jpg'
        },
        { 
          id: 3, 
          category: 'markets', 
          headline: 'Sensex Crosses 73,000 Mark for First Time', 
          details: 'Indian equity markets reach new milestone driven by strong domestic investment flows.',
          source: 'Mint',
          date: '2023-10-03',
          imageUrl: 'https://example.com/sensex.jpg'
        },
        { 
          id: 4, 
          category: 'companies', 
          headline: 'Reliance Industries Unveils Green Energy Roadmap', 
          details: 'Mukesh Ambani announces ₹75,000 crore investment in clean energy initiatives over next 5 years.',
          source: 'Financial Express',
          date: '2023-10-03',
          imageUrl: 'https://example.com/reliance.jpg'
        },
        { 
          id: 5, 
          category: 'ipo', 
          headline: 'LIC Housing Finance Subsidiary Files DRHP for ₹4,500 Crore IPO', 
          details: 'The company aims to expand operations and strengthen capital base through public offering.',
          source: 'Money Control',
          date: '2023-10-02',
          imageUrl: 'https://example.com/lic-ipo.jpg'
        },
        { 
          id: 6, 
          category: 'policy', 
          headline: 'SEBI Tightens Norms for F&O Trading, Increases Margin Requirements', 
          details: 'New regulations aim to curb excessive speculation and protect retail investors.',
          source: 'Hindu Business Line',
          date: '2023-09-30',
          imageUrl: 'https://example.com/sebi.jpg'
        },
        { 
          id: 7, 
          category: 'markets', 
          headline: 'Mutual Fund SIP Inflows Hit Record ₹18,000 Crore in September', 
          details: 'Indian retail investors continue to show strong faith in equity markets through systematic investments.',
          source: 'ET Now',
          date: '2023-09-28',
          imageUrl: 'https://example.com/mutual-funds.jpg'
        },
        { 
          id: 8, 
          category: 'companies', 
          headline: 'Tata Motors Reports 40% YoY Growth in Passenger Vehicle Sales', 
          details: 'Strong demand for SUVs and electric vehicles drives growth for the automaker.',
          source: 'NDTV Profit',
          date: '2023-09-27',
          imageUrl: 'https://example.com/tata-motors.jpg'
        }
      ];

      // Filter news by category if needed
      const filteredNews = category === 'all' ? 
        allNews : 
        allNews.filter(item => item.category === category);
      
      setNews(filteredNews);
      setLoading(false);
    };

    // Simulate API delay
    setTimeout(fetchNews, 500);
    toast.success(`Market news updated - ${category} category`);
  }, [category]);

  return (
    <div className="market-news-container">
      <h2>Indian Market News & Insights</h2>
      
      <div className="news-filters">
        <button 
          className={`filter-btn ${category === 'all' ? 'active' : ''}`}
          onClick={() => setCategory('all')}
        >
          All News
        </button>
        <button 
          className={`filter-btn ${category === 'policy' ? 'active' : ''}`}
          onClick={() => setCategory('policy')}
        >
          Policy
        </button>
        <button 
          className={`filter-btn ${category === 'markets' ? 'active' : ''}`}
          onClick={() => setCategory('markets')}
        >
          Markets
        </button>
        <button 
          className={`filter-btn ${category === 'companies' ? 'active' : ''}`}
          onClick={() => setCategory('companies')}
        >
          Companies
        </button>
        <button 
          className={`filter-btn ${category === 'sectors' ? 'active' : ''}`}
          onClick={() => setCategory('sectors')}
        >
          Sectors
        </button>
        <button 
          className={`filter-btn ${category === 'ipo' ? 'active' : ''}`}
          onClick={() => setCategory('ipo')}
        >
          IPO
        </button>
      </div>
      
      {loading ? (
        <div className="loading-news">Loading latest market news...</div>
      ) : (
        <div className="news-grid">
          {news.map((item) => (
            <div key={item.id} className="news-card">
              <div className="news-content">
                <span className="news-source">{item.source}</span>
                <span className="news-date">{item.date}</span>
                <h3 className="news-headline">{item.headline}</h3>
                <p className="news-details">{item.details}</p>
                <span className="news-category">{item.category.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="news-disclaimer">
        <p>Disclaimer: Market news provided for informational purposes only. Investment decisions should be based on thorough research.</p>
        <p>Data Sources: Economic Times, Business Standard, Moneycontrol, NDTV Profit, Financial Express, Mint</p>
      </div>
    </div>
  )
}

export default MarketNews