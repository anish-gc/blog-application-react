// src/pages/PostDetailPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api } from '../api/api'

const PostDetailPage = () => {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const fetchedPost = await api.getPost(id)
        setPost(fetchedPost)
        setError('')
      } catch (err) {
        setError('Post not found')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    
    try {
      setDeleting(true)
      await api.deletePost(id)
      navigate('/')
    } catch (err) {
      setError('Failed to delete post')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Loading post...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error}</div>
        <Link to="/" className="text-blue-500 hover:text-blue-700 mt-4 inline-block">
          ← Back to Home
        </Link>
      </div>
    )
  }

  const canEdit = user && user.id === post.authorId

  return (
    <div className="max-w-4xl mx-auto p-6">
      <article className="bg-white shadow-lg rounded-lg p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">{post.title}</h1>
          <div className="flex justify-between items-center text-gray-500 text-sm">
            <span>By <strong>{post.author}</strong></span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </header>
        
        <div className="prose max-w-none">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        
        {canEdit && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <Link 
                to={`/edit/${post.id}`}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Edit Post
              </Link>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        )}
      </article>
      
      <div className="mt-6">
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default PostDetailPage