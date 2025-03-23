import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { FaRobot, FaChartLine, FaShieldAlt, FaSyncAlt, FaChartBar, 
         FaGraduationCap, FaTrophy, FaNewspaper, FaUsers, FaSeedling, 
         FaBrain, FaChartPie, FaBolt } from 'react-icons/fa';
import './Home.css';

// Import placeholder images - replace with your actual images when available
import tradingDashboard from './assets/stacks-coins-arranged-bar-graph.jpg'; 
import aiDashboard from './assets/ai-pic.jpg'; 

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-tagline">India's Premier Virtual Trading Platform</div>
          <h1 id="heading">MahaLakshya</h1>
          <h4 id="sub-heading">The Gateway to your Financial Goal</h4>
          <p className="hero-description">
            Build wealth with confidence through our advanced virtual trading platform and AI-powered financial guidance. 
            Practice real market strategies with ₹5 lakh virtual capital and zero financial risk.
          </p>
          <div className="hero-buttons">
            {!user ? (
              <>
                <Link to="/register" className="primary-button">
                  <span>Start Free</span>
                  <span className="button-arrow">→</span>
                </Link>
                <Link to="/login" className="secondary-button">Sign In</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="primary-button">
                  <span>Dashboard</span>
                  <span className="button-arrow">→</span>
                </Link>
                <Link to="/trade" className="secondary-button">Trade Now</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-image">
            <img 
              src={tradingDashboard} 
              alt="Trading Dashboard"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x600?text=Trading+Dashboard';
              }}
            />
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">500,000+</span>
                <span className="stat-label">Virtual Capital</span>
              </div>
              <div className="stat">
                <span className="stat-number">0₹</span>
                <span className="stat-label">Risk</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Learning</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Finance Manager - USP Section */}
      <section className="ai-finance-section">
        <div className="section-badge">Our Flagship Feature</div>
        <h2>Meet Your AI Personal Finance Manager</h2>
        <p className="section-description">
          India's first AI-powered virtual assistant that creates personalized investment strategies based on 
          your financial profile, goals, and risk tolerance.
        </p>
        
        <div className="ai-features">
          <div className="ai-feature-card">
            <div className="feature-icon"><FaRobot /></div>
            <h3>Personalized Portfolio Planning</h3>
            <p>Our AI analyzes your income, expenses, and financial goals to recommend ideal asset allocation and investment opportunities.</p>
          </div>
          
          <div className="ai-feature-card">
            <div className="feature-icon"><FaChartLine /></div>
            <h3>Smart ROI Forecasting</h3>
            <p>Set your investment timeframe and desired returns, and receive AI-calculated investment pathways to achieve your goals.</p>
          </div>
          
          <div className="ai-feature-card">
            <div className="feature-icon"><FaShieldAlt /></div>
            <h3>Risk Management</h3>
            <p>Advanced algorithms assess market volatility and match investment recommendations to your personal risk tolerance level.</p>
          </div>
          
          <div className="ai-feature-card">
            <div className="feature-icon"><FaSyncAlt /></div>
            <h3>Adaptive Strategy</h3>
            <p>Your AI manager continuously learns from market changes and your portfolio performance to refine recommendations.</p>
          </div>
        </div>
        
        <div className="ai-demo">
          <div className="ai-screenshot">
            <img 
              src={aiDashboard} 
              alt="AI Finance Manager Dashboard" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x600?text=AI+Finance+Dashboard';
              }}
            />
          </div>
          <div className="ai-concept">
            <div className="concept-badge">Coming Soon</div>
            <h3>The Future of Financial Planning</h3>
            <p>Our AI Finance Manager will revolutionize how you approach investing by analyzing thousands of data points to create truly personalized strategies aligned with your unique financial situation.</p>
            <ul className="concept-benefits">
              <li>Advanced income and expense pattern analysis</li>
              <li>Goal-based investment timelines</li>
              <li>Risk-adjusted portfolio recommendations</li>
              <li>Tax-efficient investment strategies</li>
            </ul>
          </div>
        </div>
        
        <div className="cta-inline">
          <Link to={user ? "/dashboard" : "/register"} className="primary-button">
            <span>Be Among the First to Try</span>
            <span className="button-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>A Complete Trading Ecosystem</h2>
        <p className="section-description">Develop your investment skills with a comprehensive suite of professional-grade tools and resources.</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FaChartBar /></div>
            <h3>Virtual Trading Platform</h3>
            <p>Execute trades on NSE and BSE with real-time market data, advanced order types, and ₹5 lakh virtual capital.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"><FaGraduationCap /></div>
            <h3>Structured Learning Path</h3>
            <p>Master financial concepts through interactive tutorials, from basic market mechanics to advanced technical analysis.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"><FaChartLine /></div>
            <h3>Advanced Analytics</h3>
            <p>Access professional-grade charting tools with 50+ technical indicators, pattern recognition, and customizable dashboards.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"><FaTrophy /></div>
            <h3>Trading Competitions</h3>
            <p>Test your strategies against other traders in monthly contests with prizes worth up to ₹1.5 lakh.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"><FaNewspaper /></div>
            <h3>Market News & Insights</h3>
            <p>Stay informed with curated news, expert analyses, and sector reports that impact the Indian markets.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"><FaUsers /></div>
            <h3>Community Forum</h3>
            <p>Connect with fellow traders to discuss strategies, share insights, and learn from experienced investors.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>Your Journey to Financial Mastery</h2>
        <p className="section-description">Follow a proven path to develop real investing skills without the financial risk.</p>
        
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Account</h3>
            <p>Sign up in less than 2 minutes and receive ₹5 lakh in virtual capital to start your trading journey.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Set Financial Goals</h3>
            <p>Input your income, expenses, and financial objectives to receive personalized AI guidance.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Learn & Practice</h3>
            <p>Follow structured tutorials and implement strategies in a risk-free environment with real market data.</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>Analyze & Improve</h3>
            <p>Track performance metrics, receive AI-powered feedback, and refine your approach for consistent growth.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>Expert Insights on Virtual Trading</h2>
        <div className="testimonials-slider">
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"Virtual trading platforms with AI-guided learning are the future of financial education. Practicing in a risk-free environment helps develop the emotional discipline needed for successful investing."</p>
            </div>
            <div className="testimonial-footer">
              <div className="testimonial-info">
                <div className="testimonial-author">Financial Education Research</div>
                <div className="testimonial-position">Journal of Investment Strategy, 2023</div>
              </div>
            </div>
          </div>
          
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"For new investors, particularly in volatile markets like India, virtual trading environments provide invaluable learning experiences without the psychological impact of real financial losses."</p>
            </div>
            <div className="testimonial-footer">
              <div className="testimonial-info">
                <div className="testimonial-author">Market Research Insights</div>
                <div className="testimonial-position">Emerging Markets Report, 2023</div>
              </div>
            </div>
          </div>
          
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"Combining AI-powered portfolio suggestions with practical virtual trading creates a powerful educational synergy that dramatically shortens the learning curve for novice investors."</p>
            </div>
            <div className="testimonial-footer">
              <div className="testimonial-info">
                <div className="testimonial-author">FinTech Innovation Study</div>
                <div className="testimonial-position">Technology in Finance, 2023</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>Why Choose Virtual Trading</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon"><FaSeedling /></div>
            <h3>Zero Risk Learning</h3>
            <p>Develop trading skills and test strategies without risking your hard-earned money.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon"><FaBrain /></div>
            <h3>Accelerated Learning</h3>
            <p>Learn market mechanics and trading principles in weeks instead of years.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon"><FaChartPie /></div>
            <h3>Real Market Data</h3>
            <p>Practice with live NSE and BSE market data for authentic trading experience.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon"><FaBolt /></div>
            <h3>Instant Feedback</h3>
            <p>Receive immediate analysis on your trades to quickly improve decision-making.</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="cta-content">
          <h2>Begin Your Investment Journey Today</h2>
          <p>Join the next generation of informed investors with our cutting-edge virtual trading platform and AI guidance.</p>
          <div className="cta-buttons">
            {!user ? (
              <Link to="/register" className="primary-button large">
                <span>Create Free Account</span>
                <span className="button-arrow">→</span>
              </Link>
            ) : (
              <Link to="/dashboard" className="primary-button large">
                <span>Go to Dashboard</span>
                <span className="button-arrow">→</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="seo-content">
        <h2>India's Most Advanced Virtual Trading & AI Financial Planning Platform</h2>
        <p>
          MahaLakshya combines cutting-edge AI technology with a comprehensive virtual trading environment to provide unparalleled 
          financial education and planning services for Indian investors. Our platform offers personalized investment strategies 
          based on individual financial profiles, real-time market data from NSE and BSE, advanced technical analysis tools, 
          and a risk-free environment to practice and perfect your approach to stock market investing.
        </p>
        <p>
          Whether you're a beginner looking to understand market fundamentals, a student learning investment theory, 
          or an experienced trader wanting to test new strategies, MahaLakshya's AI Finance Manager creates custom 
          recommendations for your specific goals - from wealth accumulation and retirement planning to tax-efficient 
          investing and SIP optimization for Indian markets.
        </p>
      </section>
    </div>
  );
}

export default Home;