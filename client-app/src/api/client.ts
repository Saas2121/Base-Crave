import axios from 'axios'
import { UserRole } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    role: UserRole
    profile_image?: string
    created_at: string
  }
  token: string
}

export const authAPI = {
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  me: () => api.get('/auth/me'),
}

export interface Store {
  id: string
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  is_open: boolean
  owner_id: string
  created_at: string
  packs?: Pack[]
}

export interface Pack {
  id: string
  store_id: string
  title: string
  description: string | null
  pack_type: string
  price: number
  original_price: number | null
  pickup_start: string
  pickup_end: string
  total_quantity: number
  remaining_quantity: number
  image_url?: string
  status: string
  created_at: string
  stores?: Store
}

export interface Reservation {
  id: string
  user_id: string
  pack_id: string
  quantity: number
  status: string
  pickup_code: string
  created_at: string
  packs?: Pack
  stores?: Store
}

export const storesAPI = {
  getAll: (lat?: number, lng?: number) => api.get<Store[]>('/stores', { params: { lat, lng } }),
  getById: (id: string) => api.get<Store>(`/stores/${id}`),
  getMyStore: () => api.get<Store>('/stores/my/store'),
  toggleOpen: () => api.put<Store>('/stores/my/toggle'),
  create: (data: Partial<Store>) => api.post<Store>('/stores', data),
}

export const packsAPI = {
  getByStore: (storeId: string) => api.get<Pack[]>(`/stores/${storeId}/packs`),
  getById: (id: string) => api.get<Pack>(`/packs/${id}`),
  create: (data: Partial<Pack>) => api.post<Pack>('/packs', data),
  update: (id: string, data: Partial<Pack>) => api.put<Pack>(`/packs/${id}`, data),
  delete: (id: string) => api.delete(`/packs/${id}`),
}

export const reservationsAPI = {
  create: (data: { pack_id: string; quantity: number }) => api.post('/reservations', data),
  getMy: () => api.get<Reservation[]>('/reservations/my'),
  getStore: () => api.get<Reservation[]>('/reservations/store'),
  verify: (id: string, pickup_code: string) => api.post(`/reservations/${id}/verify`, { pickup_code }),
  cancel: (id: string) => api.post(`/reservations/${id}/cancel`),
}

export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (store_id: string) => api.post('/favorites', { store_id }),
  remove: (store_id: string) => api.delete(`/favorites/${store_id}`),
}

export default api
