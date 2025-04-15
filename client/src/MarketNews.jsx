import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './MarketNews.css';
import { FaSync, FaNewspaper } from 'react-icons/fa';

function MarketNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const API_URL = 'https://stock.indianapi.in/news';
  const API_KEY = import.meta.env.VITE_STOCK_API_KEY;
  const NEWS_CACHE_KEY = 'mahalakshya_news_data';
  const NEWS_CACHE_TIMESTAMP = 'mahalakshya_news_timestamp';
  
  // Map API topics to our categories
  const topicToCategory = {
    'Funding Activities': 'policy',
    'Financial Results': 'markets',
    'Corporate News': 'companies',
    'Artificial Intelligence': 'technology',
    'Cost Cutting': 'markets',
    // Add more mappings as needed
  };
  
  // Enhanced string hash function with better uniqueness
  const generateUniqueId = (item, index) => {
    const baseString = `${item.title}-${item.source}-${item.pub_date}-${index}`;
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `news-${Math.abs(hash).toString(16)}-${index}`;
  };
  
  // Local placeholder image to avoid external requests
  const PLACEHOLDER_IMAGE = '/assets/news-placeholder.png';
  
  const fetchNewsFromAPI = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      // Format and categorize the news with index-based unique IDs
      const formattedNews = response.data.map((item, index) => ({
        id: generateUniqueId(item, index),
        category: getCategoryFromTopics(item.topics),
        headline: item.title,
        details: item.summary,
        source: item.source,
        date: new Date(item.pub_date).toISOString().split('T')[0],
        imageUrl: item.image_url || '', // Don't set a default here, handle it in the render
        url: item.url,
        topics: item.topics
      }));
      
      // Store in state and cache
      setNews(formattedNews);
      localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(formattedNews));
      localStorage.setItem(NEWS_CACHE_TIMESTAMP, Date.now().toString());
      
      toast.success(`Market news updated successfully`);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to fetch market news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Helper function to map topics to categories
  const getCategoryFromTopics = (topics) => {
    if (!topics || topics.length === 0) return 'general';
    
    for (const topic of topics) {
      if (topicToCategory[topic]) return topicToCategory[topic];
    }
    
    return 'general'; // Default category
  };
  
  // Effect to load news on component mount
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      
      try {
        // Check if we have cached news data
        const cachedNews = localStorage.getItem(NEWS_CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(NEWS_CACHE_TIMESTAMP);
        
        // Use cached data if available and less than 1 hour old
        if (cachedNews && cachedTimestamp) {
          const now = Date.now();
          const timestamp = parseInt(cachedTimestamp, 10);
          const ONE_HOUR = 60 * 60 * 1000; // ms
          
          if (now - timestamp < ONE_HOUR) {
            const parsedNews = JSON.parse(cachedNews);
            setNews(parsedNews);
            setLoading(false);
            return;
          }
        }
        
        // Fetch fresh data if cache is not available or outdated
        await fetchNewsFromAPI();
      } catch (error) {
        console.error('Error loading news:', error);
        setLoading(false);
      }
    };
    
    loadNews();
  }, []);
  
  // Filter news based on category selection
  const filteredNews = category === 'all' 
    ? news 
    : news.filter(item => item.category === category);
  
  // Handle manual refresh button click
  const handleRefreshClick = () => {
    if (refreshing) return;
    fetchNewsFromAPI();
  };

  // Create a placeholder component instead of using an external URL
  const NewsPlaceholder = ({source}) => (
    <div className="placeholder-image">
      <FaNewspaper size={24} />
      <span>{source}</span>
    </div>
  );
  
  return (
    <div className="market-news-container">
      <div className="news-header">
        <h2>Indian Market News & Insights</h2>
        <button 
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={handleRefreshClick}
          disabled={refreshing}
          title="Refresh news"
        >
          <FaSync /> {refreshing ? 'Updating...' : 'Refresh'}
        </button>
      </div>
      
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
          className={`filter-btn ${category === 'technology' ? 'active' : ''}`}
          onClick={() => setCategory('technology')}
        >
          Technology
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading market news...</p>
        </div>
      ) : (
        <>
          {filteredNews.length === 0 ? (
            <p className="no-news-message">No news available for this category. Try selecting a different category or refresh the page.</p>
          ) : (
            <div className="news-grid">
              {filteredNews.map((item, index) => (
                <div key={`${item.id}-${index}`} className="news-card">
                  <div className="news-image">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.headline} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.appendChild(
                            document.createElement('div')
                          ).className = 'placeholder-image-error';
                        }} 
                      />
                    ) : (
                      <NewsPlaceholder source={item.source} />
                    )}
                  </div>
                  <div className="news-content">
                    <h3>{item.headline}</h3>
                    <p>{item.details}</p>
                    <div className="news-meta">
                      <span className="news-source">{item.source}</span>
                      <span className="news-date">{new Date(item.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    {item.topics && item.topics.length > 0 && (
                      <div className="news-topics">
                        {item.topics.map((topic, topicIndex) => (
                          <span key={`${item.id}-topic-${topicIndex}`} className="topic-tag">{topic}</span>
                        ))}
                      </div>
                    )}
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="read-more-btn">
                      Read Full Story
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MarketNews;