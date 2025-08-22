// src/components/BlogList.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/api'

const BlogList = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const fetchedPosts = await api.getPosts()
        setPosts(fetchedPosts)
        setError('')
      } catch (err) {
        setError('Failed to fetch posts')
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Loading posts...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg">No posts available</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Latest Posts</h1>
      <div className="space-y-6">
        {posts.map(post => (
          <article key={post.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-3">
              <Link 
                to={`/posts/${post.id}`} 
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {post.content.length > 150 
                ? `${post.content.substring(0, 150)}...` 
                : post.content
              }
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>By {post.author}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default BlogList