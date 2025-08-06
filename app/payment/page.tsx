'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import SharedFeeEntryForm from '../components/SharedFeeEntryForm'

export default function PaymentPage() {
  const router = useRouter()

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Society Management System" />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToHome}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Create Fee Entry
              </h1>
              <p className="text-lg text-gray-600">
                Fill in the details to create a new fee entry
              </p>
            </div>
          </div>

          {/* Fee Entry Form */}
          <SharedFeeEntryForm 
            mode="resident"
            onEntryCreated={(entry) => {
              console.log('Fee entry created:', entry)
              // You can add additional logic here if needed
            }}
            onClose={() => {
              router.push('/')
            }}
          />
        </div>
      </div>
    </div>
  )
} 