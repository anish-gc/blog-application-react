import { useNavigate } from 'react-router-dom'
import PostForm from '../components/PostForm'
import { api } from '../api/api'

const CreatePostPage = () => {
  const navigate = useNavigate()

  const handleSubmit = async (postData) => {
    try {
      await api.createPost(postData)
      // Navigate to home page or show success message
      navigate('/')
    } catch (error) {
      // Re-throw the error so PostForm can handle it
      throw error
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-8 mt-8 text-gray-800">
        Create New Post
      </h1>
      <PostForm onSubmit={handleSubmit} submitText="Create Post" />
    </div>
  )
}

export default CreatePostPage