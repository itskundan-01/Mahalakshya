import { useState, useEffect, useContext } from 'react'
import { toast } from 'react-toastify'
import { AuthContext } from './context/AuthContext'
import './Forum.css'

// Icons
import { FaThumbsUp, FaComment, FaShare, FaEllipsisV, FaUserCircle } from 'react-icons/fa'

function Forum() {
  const { user } = useContext(AuthContext)
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' })
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [commentText, setCommentText] = useState('')
  const [activeCommentId, setActiveCommentId] = useState(null)

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'general', name: 'General Discussion' },
    { id: 'technical', name: 'Technical Analysis' },
    { id: 'fundamental', name: 'Fundamental Analysis' },
    { id: 'news', name: 'Market News' },
    { id: 'strategies', name: 'Trading Strategies' }
  ]

  useEffect(() => {
    // Load dummy posts. In a real app, this would be an API call.
    const dummyPosts = [
      {
        id: 1,
        title: 'Market Momentum Analysis',
        content: 'What are your thoughts on the current market momentum? I see bullish patterns forming in several mid-cap stocks.',
        author: {
          id: 101,
          name: 'Rajiv Sharma',
          avatar: null
        },
        category: 'technical',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        upvotes: 24,
        comments: [
          {
            id: 1001,
            content: 'I agree, especially in the IT and pharma sectors.',
            author: {
              id: 102,
              name: 'Priya Mehta',
              avatar: null
            },
            timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            upvotes: 5
          }
        ]
      },
      {
        id: 2,
        title: 'New Options Trading Strategy',
        content: 'Has anyone tried the iron condor strategy in this volatile market? What were your results?',
        author: {
          id: 103,
          name: 'Amit Patel',
          avatar: null
        },
        category: 'strategies',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        upvotes: 18,
        comments: []
      },
      {
        id: 3,
        title: 'RBI Policy Impact',
        content: 'Let\'s discuss how the latest RBI policy changes might affect bank stocks in the coming quarter.',
        author: {
          id: 104,
          name: 'Neha Gupta',
          avatar: null
        },
        category: 'news',
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        upvotes: 32,
        comments: [
          {
            id: 1002,
            content: 'Private banks are likely to outperform PSUs due to their better NPA management.',
            author: {
              id: 105,
              name: 'Vikram Singh',
              avatar: null
            },
            timestamp: new Date(Date.now() - 216000000).toISOString(), // 2.5 days ago
            upvotes: 7
          }
        ]
      }
    ]
    setPosts(dummyPosts)
  }, [])

  const handlePostSubmit = (e) => {
    e.preventDefault()
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Post title and content are required')
      return
    }
    
    const post = {
      id: Date.now(),
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      author: {
        id: user?.id || 999,
        name: user?.name || 'Anonymous User',
        avatar: user?.avatar || null
      },
      timestamp: new Date().toISOString(),
      upvotes: 0,
      comments: []
    }
    
    setPosts([post, ...posts])
    setNewPost({ title: '', content: '', category: 'general' })
    toast.success('Post published successfully')
  }

  const handleUpvote = (postId) => {
    if (!user) {
      toast.info('Please login to upvote posts')
      return
    }

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, upvotes: post.upvotes + 1 }
      }
      return post
    }))
  }

  const handleCommentUpvote = (postId, commentId) => {
    if (!user) {
      toast.info('Please login to upvote comments')
      return
    }

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, upvotes: comment.upvotes + 1 }
          }
          return comment
        })
        return { ...post, comments: updatedComments }
      }
      return post
    }))
  }

  const handleAddComment = (postId) => {
    if (!user) {
      toast.info('Please login to add comments')
      return
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    const newComment = {
      id: Date.now(),
      content: commentText,
      author: {
        id: user?.id || 999,
        name: user?.name || 'Anonymous User',
        avatar: user?.avatar || null
      },
      timestamp: new Date().toISOString(),
      upvotes: 0
    }

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [newComment, ...post.comments] }
      }
      return post
    }))

    setCommentText('')
    setActiveCommentId(null)
    toast.success('Comment added successfully')
  }

  const filteredPosts = posts
    .filter(post => activeCategory === 'all' || post.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp) - new Date(a.timestamp)
      } else if (sortBy === 'popular') {
        return b.upvotes - a.upvotes
      } else if (sortBy === 'commented') {
        return b.comments.length - a.comments.length
      }
      return 0
    })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  return (
    <div className="forum-container">
      <h1>Community Forum</h1>
      <p className="forum-description">
        Connect with fellow traders to discuss strategies, share insights, and learn from experienced investors.
      </p>

      {/* Category Navigation */}
      <div className="forum-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="forum-sort">
        <span>Sort by:</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="popular">Most Upvoted</option>
          <option value="commented">Most Commented</option>
        </select>
      </div>

      {/* New Post Form */}
      {user && (
        <div className="new-post-container">
          <h3>Start a New Discussion</h3>
          <form onSubmit={handlePostSubmit}>
            <select
              value={newPost.category}
              onChange={(e) => setNewPost({...newPost, category: e.target.value})}
              className="category-select"
            >
              {categories.filter(cat => cat.id !== 'all').map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Discussion title"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              className="post-title-input"
            />
            
            <textarea
              placeholder="Share your thoughts, questions, or insights..."
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              rows={4}
              className="post-content-input"
            ></textarea>
            
            <button type="submit" className="post-submit-btn">
              Publish Post
            </button>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="posts-container">
        {filteredPosts.length === 0 ? (
          <div className="no-posts">
            <p>No discussions found in this category. Be the first to start a conversation!</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  {post.author.avatar ? (
                    <img src={post.author.avatar} alt={post.author.name} className="author-avatar" />
                  ) : (
                    <FaUserCircle className="default-avatar" />
                  )}
                  <div>
                    <span className="author-name">{post.author.name}</span>
                    <span className="post-timestamp">{formatDate(post.timestamp)}</span>
                  </div>
                </div>
                <div className="post-category-tag">{categories.find(c => c.id === post.category)?.name}</div>
              </div>
              
              <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-text">{post.content}</p>
              </div>
              
              <div className="post-actions">
                <button 
                  className="action-btn upvote-btn" 
                  onClick={() => handleUpvote(post.id)}
                >
                  <FaThumbsUp /> <span>{post.upvotes}</span>
                </button>
                
                <button 
                  className="action-btn comment-btn" 
                  onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}
                >
                  <FaComment /> <span>{post.comments.length}</span>
                </button>
                
                <button className="action-btn share-btn">
                  <FaShare /> <span>Share</span>
                </button>
                
                <button className="action-btn more-btn">
                  <FaEllipsisV />
                </button>
              </div>
              
              {/* Comment Section */}
              {(post.comments.length > 0 || activeCommentId === post.id) && (
                <div className="comments-section">
                  {activeCommentId === post.id && (
                    <div className="comment-form">
                      <textarea
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={2}
                        className="comment-input"
                      ></textarea>
                      <button 
                        className="comment-submit-btn"
                        onClick={() => handleAddComment(post.id)}
                      >
                        Comment
                      </button>
                    </div>
                  )}
                  
                  {post.comments.length > 0 && (
                    <div className="comments-list">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-author">
                            {comment.author.avatar ? (
                              <img src={comment.author.avatar} alt={comment.author.name} className="comment-avatar" />
                            ) : (
                              <FaUserCircle className="default-avatar small" />
                            )}
                            <div>
                              <span className="comment-author-name">{comment.author.name}</span>
                              <span className="comment-timestamp">{formatDate(comment.timestamp)}</span>
                            </div>
                          </div>
                          
                          <p className="comment-content">{comment.content}</p>
                          
                          <button 
                            className="comment-upvote-btn"
                            onClick={() => handleCommentUpvote(post.id, comment.id)}
                          >
                            <FaThumbsUp /> <span>{comment.upvotes}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Forum