import { create } from 'zustand'
import { User } from '../types'
import { UserRole } from '../types'
import { authAPI } from '../api/client'

interface AuthState {
  user: (User & { role: UserRole }) | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setUser: (user: (User & { role: UserRole }) | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: !!localStorage.getItem('token'),
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await authAPI.login({ email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Login failed', isLoading: false })
      throw error
    }
  },

  register: async (name, email, password, role) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await authAPI.register({ name, email, password, role })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Registration failed', isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  setUser: (user) => {
    set({ user })
  },

  checkAuth: async () => {
    set({ isLoading: true })
    const token = get().token
    if (!token) {
      set({ isAuthenticated: false, isLoading: false })
      return
    }

    try {
      const { data } = await authAPI.me()
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
