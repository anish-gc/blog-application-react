

// src/components/PostForm.jsx - Updated to handle validation errors
import { useState } from 'react'

const PostForm = ({ initialData, onSubmit, submitText }) => {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({}) 
  const [generalError, setGeneralError] = useState('') 

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})
    setGeneralError('')

    // Basic client-side validation
    if (!title.trim() || !content.trim()) {
      setGeneralError('Title and content are required')
      return
    }

    setLoading(true)

    try {
      await onSubmit({ title: title.trim(), content: content.trim() })
      // If successful, reset form (optional)
      setTitle('')
      setContent('')
    } catch (err) {
      if (err.type === 'validation') {
        // Handle validation errors - set field-specific errors
        setErrors(err.errors)
      } else if (err.type === 'general') {
        // Handle general errors
        setGeneralError(err.message)
      } else {
        // Handle old-style errors (string messages)
        setGeneralError(err.message || 'Failed to save post')
      }
    } finally {
      setLoading(false)
    }
  }

  // Clear field error when user starts typing
  const handleTitleChange = (e) => {
    setTitle(e.target.value)
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }))
    }
  }

  const handleContentChange = (e) => {
    setContent(e.target.value)
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: undefined }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
        {/* General error message */}
        {generalError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {generalError}
          </div>
        )}

        {/* Title field */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            placeholder="Enter post title"
            disabled={loading}
          />
          {/* Field-specific error for title */}
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Content field */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={handleContentChange}
            rows={12}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${errors.content ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            placeholder="Write your post content here..."
            disabled={loading}
          />
          {/* Field-specific error for content */}
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : submitText}
        </button>
      </form>
    </div>
  )
}

export default PostForm
