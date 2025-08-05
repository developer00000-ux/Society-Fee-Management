'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, getCurrentUser, signIn, signOut, signUp, LoginCredentials, RegisterData } from '@/lib/auth'
import { UserRole } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (credentials: LoginCredentials) => Promise<AuthUser>
  signUp: (data: RegisterData) => Promise<AuthUser>
  signOut: () => Promise<void>
  hasRole: (roles: UserRole[]) => boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkUser()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
          } catch (error) {
            console.error('Error getting user after sign in:', error)
            setUser(null)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        console.log('Current user found:', { email: currentUser.email, role: currentUser.role })
      } else {
        console.log('No current user found')
      }
      setUser(currentUser)
    } catch (error) {
      console.error('Error checking user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (credentials: LoginCredentials) => {
    try {
      const authUser = await signIn(credentials)
      console.log('SignIn successful:', { email: authUser.email, role: authUser.role })
      setUser(authUser)
      return authUser
    } catch (error) {
      console.error('SignIn error:', error)
      throw error
    }
  }

  const handleSignUp = async (data: RegisterData) => {
    try {
      const authUser = await signUp(data)
      setUser(authUser)
      return authUser
    } catch (error) {
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      console.log('Signing out user:', user?.email)
      await signOut()
      setUser(null)
      console.log('User signed out successfully')
      
      // Redirect to login page after successful logout
      window.location.href = '/login'
    } catch (error) {
      console.error('SignOut error:', error)
      throw error
    }
  }

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    hasRole,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 