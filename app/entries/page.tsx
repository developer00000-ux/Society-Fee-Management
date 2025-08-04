'use client'

import React from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import UserForm from '@/app/components/UserForm'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'

export default function EntriesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
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
    <ProtectedRoute requiredRoles={['resident', 'super_admin', 'colony_admin', 'block_manager']}>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <Navbar title="Society Fee Management" />
        
        {/* Navigation Links */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-4">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </a>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Entries</span>
            </div>
          </div>
        </div>

        {/* Main Content - Only UserForm */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <UserForm />
        </main>
      </div>
    </ProtectedRoute>
  )
} 