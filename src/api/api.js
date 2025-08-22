// src/api/api.js
import axios from 'axios'
import { authStore } from '../stores/authStore'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Your Django API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && authStore.getState().token) {
      authStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)


// API functions
export const api = {
  // Auth endpoints
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login/', credentials)
      console.log('Login response:', response.data); // Debug log

      return response.data
    } catch (error) {
      console.error('Login error:', error); // Debug log
      console.error('Error response:', error.response); // Debug log
      // Better error handling
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else if (error.response?.status === 401) {
        throw new Error('Invalid username or password')
      } else if (error.response?.status === 400) {
        throw new Error('Username and password are required')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('Unable to connect to server. Please check if the server is running.')
      } else {
        throw new Error(error.message || 'Login failed')
      }
    }
  },

  register: async (userData) => {
    try {
      console.log('Attempting registration with:', userData); // Debug log
      const response = await apiClient.post('/register/', userData) // Remove 'auth/' from path
      console.log('Registration response:', response.data); // Debug log
      return response.data
    } catch (error) {
      console.error('Registration error:', error); // Debug log
      console.error('Error response:', error.response); // Debug log

      if (error.response?.data) {
        const errorData = error.response.data
        if (typeof errorData === 'object') {
          // Extract first error message from Django's error format
          const firstError = Object.values(errorData)[0]
          if (Array.isArray(firstError)) {
            throw new Error(firstError[0])
          } else if (typeof firstError === 'string') {
            throw new Error(firstError)
          }
        } else if (typeof errorData === 'string') {
          throw new Error(errorData)
        }
      }
      throw new Error(error.message || 'Registration failed')
    }
  },


  getPosts: async () => {
    try {
      const response = await apiClient.get('/posts/')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch posts')
    }
  },

  getPost: async (id) => {
    try {
      const response = await apiClient.get(`/posts/${id}/`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch post')
    }
  },

  createPost: async (postData) => {
    try {
      const response = await apiClient.post('/posts/', postData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create post')
    }
  },

  updatePost: async (id, postData) => {
    try {
      const response = await apiClient.put(`/posts/${id}/`, postData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update post')
    }
  },

  deletePost: async (id) => {
    try {
      const response = await apiClient.delete(`/posts/${id}/`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete post')
    }
  }
}