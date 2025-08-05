'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'
import Link from 'next/link'

export default function BlockManagerDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

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
    <ProtectedRoute requiredRoles={['block_manager']}>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <Navbar title="Block Manager Dashboard" />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
             
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Blocks Management */}
        <Link href="/block-manager/blocks" className="block">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Blocks Management</h3>
            <p className="text-gray-600">Add, edit, and manage society blocks</p>
          </div>
        </Link>

        {/* Members Management */}
        <Link href="/block-manager/members" className="block">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Members Management</h3>
            <p className="text-gray-600">Manage society members and their details</p>
          </div>
        </Link>

        {/* Flats Management */}
        <Link href="/block-manager/flats" className="block">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v14M16 5v14" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Flats Management</h3>
            <p className="text-gray-600">Manage flat numbers and assignments</p>
          </div>
        </Link>

        {/* Fee Entries */}
        <Link href="/block-manager/fees" className="block">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fee Entries</h3>
            <p className="text-gray-600">View and manage fee entries</p>
          </div>
        </Link>

        {/* Fee Types Management */}
        <Link href="/block-manager/fee-types" className="block">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fee Types</h3>
            <p className="text-gray-600">Create and manage fee categories</p>
          </div>
        </Link>

        {/* Monthly Fee Structure */}
        <Link href="/block-manager/monthly-fee-structure" className="block">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Fee Structure</h3>
            <p className="text-gray-600">Set different fee types and amounts for each month</p>
          </div>
        </Link>

        {/* Back to Main */}
       
      </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 