'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { UserRole } from '@/types/database'

interface NavbarProps {
  title?: string
  showSidebarToggle?: boolean
  onSidebarToggle?: () => void
}

export default function Navbar({ title, showSidebarToggle = false, onSidebarToggle }: NavbarProps) {
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (signingOut) return

  
    
    setSigningOut(true)
    try {
      console.log('Starting sign out process...')
      await signOut()
      console.log('Sign out completed successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      setSigningOut(false)
      // Show error message to user
      alert('Failed to sign out. Please try again.')
    }
  }

  const getRoleDisplayName = (role: UserRole | undefined) => {
    if (!role) return 'User'
    
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'colony_admin':
        return 'Colony Admin'
      case 'block_manager':
        return 'Block Manager'
      case 'resident':
        return 'Resident'
      default:
        return 'User'
    }
  }

  return (
    <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {showSidebarToggle && (
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">
                {title || 'Society Management System'}
              </h1>
              {user && (
                <p className="text-sm text-gray-500">
                  Welcome back, {user.profile?.first_name || user.email}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.profile?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.profile?.first_name} {user?.profile?.last_name}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <p className="text-xs text-blue-600">{getRoleDisplayName(user?.role || 'resident')}</p>
            </div>
          </div>

          {/* Role-specific info */}
          {user?.profile && (
            <div className="hidden md:block text-sm text-gray-500">
              {user.role === 'colony_admin' && user.profile.colony_id && (
                <span>Colony: {user.profile.colony_id}</span>
              )}
              {user.role === 'block_manager' && user.profile.building_id && (
                <span>Building: {user.profile.building_id}</span>
              )}
              {user.role === 'resident' && user.profile.colony_id && (
                <span>Colony: {user.profile.colony_id}</span>
              )}
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {signingOut ? (
              <svg className="mr-2 h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
            {signingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  )
} 