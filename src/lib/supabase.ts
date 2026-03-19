/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cqxmrfpxvutxgmhokkmc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxeG1yZnB4dnV0eGdtaG9ra21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjQ0NjcsImV4cCI6MjA4OTE0MDQ2N30.6fa8qf7SPvxriHpOv4k1NNFR7VysYFOBKDpGP20fvSY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'student' | 'warden'

export interface DBUser {
  id: string
  email: string
  name: string
  room_number: string | null
  branch: string | null
  semester: string | null
  role: UserRole
  profile_pic: string | null
  password_changed: boolean
  created_at: string
  updated_at: string
}

export interface DBSlot {
  id: string
  date: string
  start_time: string
  stone_id: number
  user_id: string | null
  status: 'available' | 'booked' | 'waiting' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface DBLaundryOrder {
  id: string
  user_id: string
  items_json: LaundryItem[]
  total_price: number
  status: 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled'
  payment_status: 'unpaid' | 'pending_approval' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface LaundryItem {
  name: string
  quantity: number
  price: number
}

export interface DBUrgentRequest {
  id: string
  user_id: string
  message: string
  slot_id: string | null
  status: 'open' | 'resolved' | 'dismissed'
  created_at: string
  updated_at: string
}
