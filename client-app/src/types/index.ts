export enum UserRole {
  CONSUMER = 'consumer',
  STORE_ADMIN = 'store_admin'
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
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
