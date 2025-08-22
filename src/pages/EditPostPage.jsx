import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PostForm from '../components/PostForm'
import { api } from '../api/api'

const EditPostPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const fetchedPost = await api.getPost(id)
        setPost(fetchedPost)
      } catch (err) {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, navigate])

  const handleSubmit = async (postData) => {
    await api.updatePost(id, postData)
    navigate(`/posts/${id}`)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-8 mt-8 text-gray-800">
        Edit Post
      </h1>
      <PostForm 
        initialData={post} 
        onSubmit={handleSubmit} 
        submitText="Update Post" 
      />
    </div>
  )
}

export default EditPostPage