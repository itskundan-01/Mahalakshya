//// filepath: /client/src/Forum.jsx
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

function Forum() {
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')

  useEffect(() => {
    // Load dummy posts. Replace with API call to fetch posts.
    const dummyPosts = [
      { id: 1, content: 'What are your thoughts on today’s market?' },
      { id: 2, content: 'Anyone tried a new trading strategy recently?' },
    ]
    setPosts(dummyPosts)
  }, [])

  const handlePost = () => {
    if (!newPost.trim()) {
      toast.error('Post content cannot be empty')
      return
    }
    const post = { id: posts.length + 1, content: newPost }
    setPosts([post, ...posts])
    setNewPost('')
    toast.success('Post added successfully')
  }

  return (
    <div>
      <h2>Community Forum</h2>
      <textarea 
        placeholder="Share your thoughts..." 
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        rows={4}
        cols={50}
      ></textarea>
      <br />
      <button onClick={handlePost}>Post</button>
      <ul>
        {posts.map((post) => (
          <li key={post.id} style={{ margin: '1em 0' }}>{post.content}</li>
        ))}
      </ul>
    </div>
  )
}

export default Forum