'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { UserRole } from '@/types/database'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  fallback = null 
}: ProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      console.log('ProtectedRoute check:', {
        hasUser: !!user,
        userRole: user?.role,
        requiredRoles,
        hasRequiredRole: hasRole(requiredRoles)
      })
      
      if (!user) {
        console.log('No user, redirecting to login')
        router.push('/login')
        return
      }

      if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
        console.log('User does not have required roles, redirecting to unauthorized')
        router.push('/unauthorized')
        return
      }
    }
  }, [user, loading, hasRole, requiredRoles, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Redirecting to login...</h2>
        </div>
      </div>
    )
  }

  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 