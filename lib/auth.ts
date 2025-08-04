import { supabase, createServerClient } from './supabase'
import { UserProfile, UserRole } from '@/types/database'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  profile?: UserProfile
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: UserRole
  colony_id?: string
  building_id?: string
  flat_id?: string
  phone?: string
}

// Get role-based redirect path
export function getRoleBasedRedirect(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin/dashboard'
    case 'colony_admin':
      return '/colony-admin/dashboard'
    case 'block_manager':
      return '/block-manager/dashboard'
    case 'resident':
      return '/entries'
    default:
      return '/login'
  }
}

// Check if user has required role
export function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

// Get user's accessible data scope
export function getUserDataScope(role: UserRole, profile?: UserProfile) {
  switch (role) {
    case 'super_admin':
      return { canAccessAll: true }
    case 'colony_admin':
      return { 
        canAccessAll: false, 
        colonyId: profile?.colony_id 
      }
    case 'block_manager':
      return { 
        canAccessAll: false, 
        colonyId: profile?.colony_id,
        buildingId: profile?.building_id 
      }
    case 'resident':
      return { 
        canAccessAll: false, 
        colonyId: profile?.colony_id,
        buildingId: profile?.building_id,
        flatId: profile?.flat_id 
      }
    default:
      return { canAccessAll: false }
  }
}

// Authentication functions
export async function signIn(credentials: LoginCredentials): Promise<AuthUser> {
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!user) {
    throw new Error('User not found')
  }

  // Get user profile using service role to bypass RLS
  const serverClient = createServerClient()
  const { data: profile, error: profileError } = await serverClient
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error('Profile not found')
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role,
    profile
  }
}

export async function signUp(data: RegisterData): Promise<AuthUser> {
  // Create user in Supabase Auth
  const { data: { user }, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!user) {
    throw new Error('Failed to create user')
  }

  // Create user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: user.id,
      role: data.role,
      first_name: data.first_name,
      last_name: data.last_name,
      colony_id: data.colony_id,
      building_id: data.building_id,
      flat_id: data.flat_id,
      phone: data.phone
    })
    .select()
    .single()

  if (profileError) {
    throw new Error('Failed to create user profile')
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role,
    profile
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user profile using service role to bypass RLS
  const serverClient = createServerClient()
  const { data: profile } = await serverClient
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role,
    profile
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return profile
}

export async function createUserProfile(data: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return profile
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return null
  }

  return profile
}

export async function getUsersByRole(role: UserRole, scope?: { colonyId?: string; buildingId?: string }): Promise<UserProfile[]> {
  let query = supabase
    .from('user_profiles')
    .select('*')
    .eq('role', role)
    .eq('is_active', true)

  if (scope?.colonyId) {
    query = query.eq('colony_id', scope.colonyId)
  }

  if (scope?.buildingId) {
    query = query.eq('building_id', scope.buildingId)
  }

  const { data: users, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return users || []
}

// Password reset functions
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    throw new Error(error.message)
  }
}

// Session management
export async function createUserSession(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
  await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent
    })
}

export async function endUserSession(sessionId: string): Promise<void> {
  await supabase
    .from('user_sessions')
    .update({
      logout_at: new Date().toISOString(),
      is_active: false
    })
    .eq('id', sessionId)
}

export async function getActiveSessions(userId: string): Promise<any[]> {
  const { data: sessions, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('login_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return sessions || []
} 