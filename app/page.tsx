'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { getRoleBasedRedirect } from '@/lib/auth'
import SharedFeeEntries from './components/SharedFeeEntries'
import Navbar from './components/Navbar'
import PaymentRequestModal from './components/PaymentRequestModal'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      console.log('Main page redirect:', { userRole: user.role, userEmail: user.email })
      const redirectPath = getRoleBasedRedirect(user.role)
      console.log('Redirecting to:', redirectPath)
      router.replace(redirectPath)
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Redirecting to dashboard...</h2>
          <p className="text-gray-600 mt-2">Please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar title="Society Management System" />
      
      {/* Main Content */}
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Society Management System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your society's fee entries, payments, and administrative tasks efficiently.
            Please sign in to access your personalized dashboard.
          </p>
        </div>

        {/* Shared Fee Entries for Public View */}
        <div>

        <div className="mb-8">
          <SharedFeeEntries 
            mode="resident"
            title="Recent Fee Entries"
            subtitle="Public view of recent fee entries in the system"
            showCreateButton={false}
            showDeleteButton={false}
            showPaymentButton={true}
            onPaymentClick={() => router.push('/payment')}
            />
        </div>
            </div>
      </div>
    </div>
  )
}
