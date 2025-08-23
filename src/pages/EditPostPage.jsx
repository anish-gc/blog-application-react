import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PostForm from '../components/PostForm'
import { api } from '../api/api'
import { authStore } from '../stores/authStore'

const EditPostPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is authenticated
    const token = authStore.getState().token
    if (!token) {
      navigate('/login') // Redirect to login if not authenticated
      return
    }

    const fetchPost = async () => {
      try {
        setLoading(true)
        setError('')
        
        const response = await api.getPost(id)
        
        // Handle different response formats from your API
        let postData
        if (response.post) {
          postData = response.post
        } else if (response.data) {
          postData = response.data
        } else {
          postData = response
        }
        
        setPost(postData)
        
      } catch (err) {
        setError(err.message || 'Failed to load post for editing')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPost()
    } else {
      navigate('/')
    }
  }, [id, navigate])

  const handleSubmit = async (postData) => {
    try {
      setError('')
      
      const response = await api.updatePost(id, postData)
      
      // Navigate back to the post detail page or posts list
      navigate(`/posts/${id}`)
      
    } catch (err) {
      setError(err.message || 'Failed to update post')
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

  if (error && !post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button 
            onClick={() => navigate('/')} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back to Posts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Edit Post
      </h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {post && (
        <PostForm 
          initialData={{
            title: post.title || '',
            content: post.content || '',
            is_published: post.is_published || post.is_active || false
          }} 
          onSubmit={handleSubmit} 
          submitText="Update Post" 
        />
      )}
    </div>
  )
}

export default EditPostPage
