'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'
import SharedFeeEntries from '@/app/components/SharedFeeEntries'

export default function AllEntriesPage() {
  console.log('AllEntriesPage component rendered')
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to login')
      router.push('/login')
    } else if (!loading && user) {
      console.log('User found:', { email: user.email, role: user.role })
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ProtectedRoute requiredRoles={[]}>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <Navbar title="All Fee Entries" />
        
        {/* Navigation Links */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link
                href="/entries"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Entries
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">All Entries</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.role === 'resident' ? 'Your Fee Entries' : 'All Fee Entries'}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {user.role === 'resident' 
                      ? 'Complete history of your fee payments' 
                      : 'Complete history of all fee payments'
                    }
                  </p>
                </div>
                <Link
                  href="/entries"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Back to Entries
                </Link>
              </div>
            </div>

            {/* Shared Fee Entries Component */}
            <SharedFeeEntries 
              mode={user.role === 'resident' ? 'resident' : 'block_manager'}
              title={user.role === 'resident' ? 'Your Fee Entries' : 'All Fee Entries'}
              subtitle={user.role === 'resident' 
                ? 'Complete history of your fee payments' 
                : 'Complete history of all fee payments'
              }
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 