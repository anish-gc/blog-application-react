import { create } from 'zustand'

export const authStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  
  init: () => {
    const token = localStorage.getItem('blog_token')
    const user = localStorage.getItem('blog_user')
    if (token && user) {
      set({ token, user: JSON.parse(user) })
    }
  },
  
  setUser: (user, token) => {
    localStorage.setItem('blog_token', token)
    localStorage.setItem('blog_user', JSON.stringify(user))
    set({ user, token })
  },
  
  logout: () => {
    localStorage.removeItem('blog_token')
    localStorage.removeItem('blog_user')
    set({ user: null, token: null })
  },
  
  setLoading: (isLoading) => set({ isLoading })
}))

export const useAuthStore = () => authStore()