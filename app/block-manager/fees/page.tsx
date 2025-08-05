'use client'

import React from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../components/ProtectedRoute'
import SharedFeeEntryForm from '../../components/SharedFeeEntryForm'
import SharedFeeEntries from '../../components/SharedFeeEntries'

export default function BlockManagerFeesPage() {
  return (
    <ProtectedRoute requiredRoles={['block_manager']}>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <Navbar title="Fee Management" />
        
        {/* Navigation Links */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-4">
              <Link
                href="/block-manager/dashboard"
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Fee Management</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
              <p className="text-sm text-gray-600 mt-1">Create and manage fee entries</p>
            </div>
          </div>

          {/* Shared Fee Entry Form */}
          <div className="mb-8">
            <SharedFeeEntryForm 
              mode="block_manager" 
            />
          </div>

          {/* Shared Fee Entries Component */}
          <SharedFeeEntries 
            mode="block_manager"
            showCreateButton={false}
            showDeleteButton={true}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
} 