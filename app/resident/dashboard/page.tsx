'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import UserForm from '@/app/components/UserForm'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'

export default function ResidentDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user && user.role === 'resident') {
      router.push('/entries')
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
    <ProtectedRoute requiredRoles={['resident']}>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <Navbar title="Society Fee Management" />

        {/* Main Content - Only UserForm */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <UserForm />
        </main>
      </div>
    </ProtectedRoute>
  )
} 