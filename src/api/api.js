// src/api/api.js - Complete file with pagination support
import axios from 'axios'
import { authStore } from '../stores/authStore'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
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
      return response.data
    } catch (error) {
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
      const response = await apiClient.post('/auth/register/', userData)
      return response.data
    } catch (error) {
      if (error.response?.data) {
        const status = error.response.status;
        const errorData = error.response.data

        if (status >= 400 && status < 600 && typeof error.response.data === 'string') {
          throw new Error('Something went wrong. Please try again later.')
        }
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0]
          if (Array.isArray(firstError)) {
            throw new Error(firstError[0])
          } else if (typeof firstError === 'string') {
            throw new Error(firstError)
          }
        } else if (typeof errorData === 'string') {
          throw new Error(errorData)
        } else if (error.code === "ERR_BAD_REQUEST") {
          throw new Error('Server error. Please try again later.')
        }
      }
      throw new Error(error.message || 'Registration failed')
    }
  },

  // Updated to support pagination
  getPosts: async (page = 1, perPage = 20) => {
    try {
      const response = await apiClient.get('/posts/', {
        params: { page, per_page: perPage }
      })
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
      const response = await apiClient.post('/posts/create/', postData);
      return response.data;
    } catch (error) {
      // Check if it's a validation error (400 status with errors object)
      if (error.response?.status === 400 && error.response?.data?.errors) {
        // Throw the validation errors object
        throw {
          type: 'validation',
          errors: error.response.data.errors
        };
      }

      // For other types of errors
      throw {
        type: 'general',
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to create post'
      };
    }
  },

  updatePost: async (id, postData) => {
    try {
      const response = await apiClient.put(`/posts/${id}/update/`, postData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update post')
    }
  },

  deletePost: async (id) => {
    try {
      const response = await apiClient.delete(`/posts/${id}/delete/`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete post')
    }
  },

  // Updated to support pagination
  getUserPosts: async (page = 1, perPage = 20) => {
    try {
      const response = await apiClient.get('/posts/my-posts/', {
        params: { page, per_page: perPage }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user posts')
    }
  }
}