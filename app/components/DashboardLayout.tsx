'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/AuthContext'
import { UserRole } from '@/types/database'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getMenuItems = () => {
    if (!user) return []

    switch (user.role) {
      case 'super_admin':
        return [
          { name: 'Dashboard', href: '/super-admin/dashboard', icon: 'HomeIcon' },
          { name: 'Colonies', href: '/super-admin/colonies', icon: 'BuildingOfficeIcon' },
          { name: 'Users', href: '/super-admin/users', icon: 'UsersIcon' },
          { name: 'Analytics', href: '/super-admin/analytics', icon: 'ChartBarIcon' },
          { name: 'Billing', href: '/super-admin/billing', icon: 'CreditCardIcon' },
          { name: 'Settings', href: '/super-admin/settings', icon: 'CogIcon' },
        ]
      case 'colony_admin':
        return [
          { name: 'Dashboard', href: '/colony-admin/dashboard', icon: 'HomeIcon' },
          { name: 'Buildings', href: '/colony-admin/buildings', icon: 'BuildingOfficeIcon' },
          { name: 'Residents', href: '/colony-admin/residents', icon: 'UsersIcon' },
          { name: 'Billing', href: '/colony-admin/billing', icon: 'CreditCardIcon' },
          { name: 'Maintenance', href: '/colony-admin/maintenance', icon: 'WrenchIcon' },
          { name: 'Reports', href: '/colony-admin/reports', icon: 'DocumentChartBarIcon' },
        ]
      case 'block_manager':
        return [
          { name: 'Dashboard', href: '/block-manager/dashboard', icon: 'HomeIcon' },
          { name: 'Floors', href: '/block-manager/floors', icon: 'BuildingOfficeIcon' },
          { name: 'Residents', href: '/block-manager/residents', icon: 'UsersIcon' },
          { name: 'Maintenance', href: '/block-manager/maintenance', icon: 'WrenchIcon' },
          { name: 'Billing', href: '/block-manager/billing', icon: 'CreditCardIcon' },
        ]
      case 'resident':
        return [
          { name: 'Dashboard', href: '/resident/dashboard', icon: 'HomeIcon' },
          { name: 'Bills', href: '/resident/bills', icon: 'CreditCardIcon' },
          { name: 'Payments', href: '/resident/payments', icon: 'CurrencyDollarIcon' },
          { name: 'Maintenance', href: '/resident/maintenance', icon: 'WrenchIcon' },
          { name: 'Profile', href: '/resident/profile', icon: 'UserIcon' },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">Society MS</h1>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {title && (
                <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">{title}</h1>
              )}
            </div>

            <div className="flex items-center space-x-4">
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
} 