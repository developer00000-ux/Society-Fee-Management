// User roles
export type UserRole = 'super_admin' | 'colony_admin' | 'block_manager' | 'resident';
export type FlatStatus = 'vacant' | 'occupied' | 'rented' | 'maintenance';
export type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type AnnouncementType = 'general' | 'maintenance' | 'billing' | 'emergency' | 'event';
export type AnnouncementScope = 'colony' | 'building' | 'floor' | 'flat';
export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'suspended';

// User profiles (extends Supabase auth.users)
export interface UserProfile {
  id: string
  role: UserRole
  colony_id?: string
  building_id?: string
  flat_id?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar_url?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Colonies (Residential complexes)
export interface Colony {
  id: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  total_buildings: number
  total_flats: number
  admin_id?: string
  subscription_plan: SubscriptionPlan
  subscription_status: SubscriptionStatus
  created_at: string
  updated_at: string
}

// Buildings/Blocks within colonies
export interface Building {
  id: string
  colony_id: string
  name: string
  building_type: string
  total_floors: number
  total_flats: number
  manager_id?: string
  has_lift: boolean
  has_parking: boolean
  construction_year?: number
  created_at: string
  updated_at: string
}

// Floors within buildings
export interface Floor {
  id: string
  building_id: string
  floor_number: number
  floor_name?: string
  total_flats: number
  base_maintenance_charge: number
  floor_area_sqft?: number
  created_at: string
}

// Individual flats/units
export interface Flat {
  id: string
  floor_id: string
  flat_number: string
  flat_type: string
  area_sqft?: number
  status: FlatStatus
  monthly_rent: number
  security_deposit: number
  owner_id?: string
  tenant_id?: string
  lease_start_date?: string
  lease_end_date?: string
  created_at: string
  updated_at: string
}

// Extended Flat interface with relationships
export interface FlatWithRelations extends Flat {
  block_id?: string
  block_name?: string
  floors?: {
    id: string
    floor_number: number
    floor_name?: string
    building_id: string
    buildings?: {
      id: string
      name: string
    }
  }
}

// Bill categories for flexible billing
export interface BillCategory {
  id: string
  name: string
  description?: string
  applies_to: AnnouncementScope
  is_recurring: boolean
  is_active: boolean
  created_at: string
}

// Monthly bills for residents
export interface Bill {
  id: string
  flat_id: string
  category_id: string
  amount: number
  billing_month: string
  due_date: string
  status: BillStatus
  description?: string
  created_by: string
  created_at: string
  updated_at: string
}

// Payment records
export interface Payment {
  id: string
  bill_id: string
  amount: number
  payment_method?: string
  payment_date: string
  transaction_id?: string
  gateway_response?: any
  status: PaymentStatus
  created_at: string
}

// Maintenance requests from residents
export interface MaintenanceRequest {
  id: string
  flat_id: string
  category?: string
  title: string
  description: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  estimated_cost?: number
  actual_cost?: number
  assigned_to?: string
  created_by: string
  resolved_by?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

// Announcements and notifications
export interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  scope_type: AnnouncementScope
  scope_id?: string
  is_urgent: boolean
  valid_until?: string
  created_by: string
  created_at: string
}

// Session tracking for security
export interface UserSession {
  id: string
  user_id: string
  ip_address?: string
  user_agent?: string
  login_at: string
  logout_at?: string
  is_active: boolean
}

// Legacy types for backward compatibility
export interface FeeEntry {
  id: string
  block: string
  member_name: string
  flat_number: string
  months: string[]
  fee: number
  total_fee: number
  payment_type: string
  remarks: string
  created_at: string
  payment_confirmed?: boolean
  payment_confirmed_by?: string
  payment_confirmed_at?: string
  created_by?: string
}

export interface Block {
  id: string
  block_name: string
  description: string | null
  colony_id?: string
  colony_name?: string
  created_at: string
}

export interface Member {
  id: string
  name: string
  phone: string | null
  email: string | null
  block_id: string | null
  flat_id: string | null
  user_id: string | null // Link to user account
  created_at: string
}

// Fee types for different categories of fees
export interface FeeType {
  id: string
  name: string
  description: string
  amount: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Database schema types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      colonies: {
        Row: Colony
        Insert: Omit<Colony, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Colony, 'id' | 'created_at' | 'updated_at'>>
      }
      buildings: {
        Row: Building
        Insert: Omit<Building, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Building, 'id' | 'created_at' | 'updated_at'>>
      }
      floors: {
        Row: Floor
        Insert: Omit<Floor, 'id' | 'created_at'>
        Update: Partial<Omit<Floor, 'id' | 'created_at'>>
      }
      flats: {
        Row: Flat
        Insert: Omit<Flat, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Flat, 'id' | 'created_at' | 'updated_at'>>
      }
      bill_categories: {
        Row: BillCategory
        Insert: Omit<BillCategory, 'id' | 'created_at'>
        Update: Partial<Omit<BillCategory, 'id' | 'created_at'>>
      }
      bills: {
        Row: Bill
        Insert: Omit<Bill, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Bill, 'id' | 'created_at' | 'updated_at'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at'>
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>
      }
      maintenance_requests: {
        Row: MaintenanceRequest
        Insert: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at'>>
      }
      announcements: {
        Row: Announcement
        Insert: Omit<Announcement, 'id' | 'created_at'>
        Update: Partial<Omit<Announcement, 'id' | 'created_at'>>
      }
      user_sessions: {
        Row: UserSession
        Insert: Omit<UserSession, 'id' | 'created_at'>
        Update: Partial<Omit<UserSession, 'id' | 'created_at'>>
      }
      fee_types: {
        Row: FeeType
        Insert: Omit<FeeType, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<FeeType, 'id' | 'created_at' | 'updated_at'>>
      }
      // Legacy tables for backward compatibility
      fee_entries: {
        Row: FeeEntry
        Insert: Omit<FeeEntry, 'id' | 'created_at'>
        Update: Partial<Omit<FeeEntry, 'id' | 'created_at'>>
      }
      blocks: {
        Row: Block
        Insert: Omit<Block, 'id' | 'created_at'>
        Update: Partial<Omit<Block, 'id' | 'created_at'>>
      }
      members: {
        Row: Member
        Insert: Omit<Member, 'id' | 'created_at'>
        Update: Partial<Omit<Member, 'id' | 'created_at'>>
      }
    }
  }
} 