'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, getCurrentUser, signIn, signOut, signUp, LoginCredentials, RegisterData } from '@/lib/auth'
import { UserRole } from '@/types/database'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (credentials: LoginCredentials) => Promise<void>
  signUp: (data: RegisterData) => Promise<void>
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
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
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
      setUser(authUser)
    } catch (error) {
      throw error
    }
  }

  const handleSignUp = async (data: RegisterData) => {
    try {
      const authUser = await signUp(data)
      setUser(authUser)
    } catch (error) {
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
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