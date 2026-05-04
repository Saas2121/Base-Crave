export enum UserRole {
  CONSUMER = 'consumer',
  STORE_ADMIN = 'store_admin'
}

export enum PackType {
  SURPRISE = 'surprise',
  FIXED = 'fixed'
}

export enum PackStatus {
  ACTIVE = 'active',
  SOLD_OUT = 'sold_out',
  EXPIRED = 'expired'
}

export enum ReservationStatus {
  RESERVED = 'reserved',
  IN_PROCESS = 'in_process',
  READY = 'ready',
  PICKED_UP = 'picked_up',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  is_open: boolean;
  owner_id: string;
  created_at: string;
}

export interface Pack {
  id: string;
  store_id: string;
  title: string;
  description: string | null;
  pack_type: PackType;
  price: number;
  original_price: number | null;
  pickup_start: string;
  pickup_end: string;
  total_quantity: number;
  remaining_quantity: number;
  status: PackStatus;
  created_at: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  pack_id: string;
  quantity: number;
  status: ReservationStatus;
  pickup_code: string;
  created_at: string;
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}
