// src/components/BlogList.jsx - Updated with pagination functionality
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
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    per_page: 20,
    total: 0,
    has_next: false,
    has_previous: false
  })
  const [currentPage, setCurrentPage] = useState(1)
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

  // Fetch posts when authentication state changes, component mounts, or page changes
  useEffect(() => {
    // Don't fetch until we've determined the auth state
    if (!authInitialized) {
      return
    }

    fetchPosts(currentPage);
  }, [isAuthenticated, authInitialized, currentPage])

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true)
      setError('')
      let response

      if (isAuthenticated) {
        // Fetch only user's posts when authenticated
        response = await api.getUserPosts(page)
      } else {
        // Fetch all posts when not authenticated
        response = await api.getPosts(page)
      }

      // Handle different response formats
      let postsArray = []
      let paginationData = {
        page: 1,
        pages: 1,
        per_page: 20,
        total: 0,
        has_next: false,
        has_previous: false
      }

      if (Array.isArray(response)) {
        // Legacy format - just an array of posts
        postsArray = response
      } else if (response && response.posts) {
        // New format with pagination
        postsArray = response.posts || []
        paginationData = response.pagination || paginationData
      } else if (response && Array.isArray(response.data)) {
        postsArray = response.data
      } else {
        postsArray = []
      }

      setPosts(postsArray)
      setPagination(paginationData)
      setError('')
    } catch (err) {
      setError('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage)
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' })
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

      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }))

      // If this was the last post on the current page and we're not on page 1,
      // go to the previous page
      if (posts.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1)
      }

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

  // Generate page numbers for pagination UI
  const getPageNumbers = () => {
    const { page, pages } = pagination
    const pageNumbers = []
    const maxVisiblePages = 5

    if (pages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Show smart pagination with ellipsis
      const startPage = Math.max(1, page - 2)
      const endPage = Math.min(pages, page + 2)

      if (startPage > 1) {
        pageNumbers.push(1)
        if (startPage > 2) pageNumbers.push('...')
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      if (endPage < pages) {
        if (endPage < pages - 1) pageNumbers.push('...')
        pageNumbers.push(pages)
      }
    }

    return pageNumbers
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
          onClick={() => fetchPosts(currentPage)}
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
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isAuthenticated ? 'My Posts' : 'Latest Posts'}
          </h1>
          {pagination.total > 0 && (
            <p className="text-gray-600 mt-2">
              Showing {posts.length} of {pagination.total} posts
            </p>
          )}
        </div>
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

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center mt-12 space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.has_previous}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
          >
            Previous
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : null}
              disabled={typeof pageNum !== 'number'}
              className={`px-4 py-2 text-sm font-medium border transition-colors ${pageNum === currentPage
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : typeof pageNum === 'number'
                    ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 border-gray-300 cursor-default'
                }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.has_next}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {pagination.total > 0 && (
        <div className="text-center text-sm text-gray-600 mt-4">
          Page {pagination.page} of {pagination.pages}
        </div>
      )}
    </div>
  )
}

export default BlogList