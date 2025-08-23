// pages/PostDetailPage.jsx - Fixed version
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api/api'
import { authStore } from '../stores/authStore'

const PostDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  // Check authentication status
  useEffect(() => {
    const token = authStore.getState().token
    const user = authStore.getState().user
    setIsAuthenticated(!!token)
    
    // Subscribe to auth changes
    const unsubscribe = authStore.subscribe((state) => {
      setIsAuthenticated(!!state.token)
    })
    
    return unsubscribe
  }, [])

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        navigate('/')
        return
      }

      try {
        setLoading(true)
        setError('')
        
        const response = await api.getPost(id)
        
        // Handle different response formats
        let postData
        if (response.post) {
          postData = response.post
        } else if (response.data) {
          postData = response.data
        } else {
          postData = response
        }
        
        
        // Validate that we have the required data
        if (!postData || typeof postData !== 'object') {
          throw new Error('Invalid post data received')
        }
        
        setPost(postData)
        
        // Check if current user is the owner
        const currentUser = authStore.getState().user
        const isPostOwner = currentUser && (
          (postData.author?.id === currentUser.id) || 
          (postData.author?.username === currentUser.username) ||
          (postData.author_id === currentUser.id)
        )
        setIsOwner(isPostOwner)
        
      } catch (err) {
        setError(err.message || 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, navigate])

  const handleEdit = () => {
    navigate(`/posts/edit/${id}`)
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await api.deletePost(id)
      navigate('/')
    } catch (err) {
      alert('Failed to delete post: ' + (err.message || 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="text-lg text-gray-600">Loading post...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Posts
          </Link>
        </div>
      </div>
    )
  }

  // Safety check - make sure post exists and has required fields
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-600 text-lg mb-4">Post not found</div>
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Posts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Navigation */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Posts
        </Link>
      </div>

      {/* Post Content */}
      <article className="bg-white shadow-lg rounded-lg p-8">
        {/* Post Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {post.title || 'Untitled'}
            </h1>
            <div className="flex items-center text-gray-600 text-sm space-x-4">
              <span>
                By {post.author?.username || post.author || 'Unknown Author'}
              </span>
              <span>
                {post.created_at 
                  ? new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Unknown date'
                }
              </span>
              {!post.is_published && !post.is_active && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                  Draft
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons - Only show for owner */}
          {isOwner && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="prose max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content || 'No content available'}
          </div>
        </div>

        {/* Post Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {post.updated_at && post.updated_at !== post.created_at && (
              <span>
                Last updated: {new Date(post.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}

export default PostDetailPage