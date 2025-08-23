// src/components/BlogList.jsx - Updated with delete functionality
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/api'
import { authStore } from '../stores/authStore'

const BlogList = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState(null)
  const navigate = useNavigate()

  // Check authentication status on mount and subscribe to changes
  useEffect(() => {
    const checkAuth = () => {
      const token = authStore.getState().token
      const newAuthState = !!token
      setIsAuthenticated(newAuthState)
      setAuthInitialized(true)
    }

    // Initial check
    checkAuth()

    // Subscribe to auth state changes
    const unsubscribe = authStore.subscribe((state) => {
      const newAuthState = !!state.token
      setIsAuthenticated(newAuthState)
    })

    return unsubscribe
  }, [])

  // Fetch posts when authentication state changes or component mounts
  useEffect(() => {
    // Don't fetch until we've determined the auth state
    if (!authInitialized) {
      return
    }

    fetchPosts();
  }, [isAuthenticated, authInitialized]) // Added authInitialized as dependency

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError('')
      let fetchedPosts


      if (isAuthenticated) {
        // Fetch only user's posts when authenticated
        fetchedPosts = await api.getUserPosts()
      } else {
        // Fetch all posts when not authenticated
        fetchedPosts = await api.getPosts()
      }

      // Handle different response formats
      let postsArray = []
      if (Array.isArray(fetchedPosts)) {
        postsArray = fetchedPosts
      } else if (fetchedPosts && Array.isArray(fetchedPosts.data)) {
        postsArray = fetchedPosts.data
      } else if (fetchedPosts && Array.isArray(fetchedPosts.posts)) {
        postsArray = fetchedPosts.posts
      } else {
        postsArray = []
      }

      setPosts(postsArray)
      setError('')
    } catch (err) {
      setError('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (postId) => {
    navigate(`/posts/edit/${postId}`)
  }

  const handleDeleteClick = async (postId, postTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingPostId(postId)
      await api.deletePost(postId)

      // Remove the deleted post from the list
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))

      // Show success message
      setError('')
      alert('Post deleted successfully!')
    } catch (err) {
      alert(`Failed to delete post: ${err.message || 'Unknown error'}`)
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleViewClick = (postId) => {
    navigate(`/posts/${postId}`)
  }

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
        <button
          onClick={fetchPosts}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // Additional safety check
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg">
          {!Array.isArray(posts) ? 'Invalid data format' :
            isAuthenticated ? 'You have no posts yet' : 'No posts available'}
        </div>
        {isAuthenticated && (
          <Link
            to="/create/post"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Post
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {isAuthenticated ? 'My Posts' : 'Latest Posts'}
        </h1>
        {isAuthenticated && (
          <Link
            to="/create/post"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            New Post
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {posts.map(post => (
          <article key={post.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-semibold flex-1">
                <Link
                  to={`/posts/${post.id}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>

              {/* Action Buttons - Only show for authenticated users */}
              {isAuthenticated && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleViewClick(post.id)}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                    title="View Post"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditClick(post.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    title="Edit Post"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(post.id, post.title)}
                    disabled={deletingPostId === post.id}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                    title="Delete Post"
                  >
                    {deletingPostId === post.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-4 leading-relaxed">
              {post.content && post.content.length > 150
                ? `${post.content.substring(0, 150)}...`
                : post.content || 'No content available'
              }
            </p>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>By {post.author?.username || post.author || 'Unknown'}</span>
              <span>
                {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown date'}
                {post.is_published === false && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    Draft
                  </span>
                )}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default BlogList