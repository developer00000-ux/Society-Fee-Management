'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { getPendingPayments, getConfirmedPayments } from '@/lib/database'
import FeeTable from '@/app/components/FeeTable'
import PaymentConfirmationModal from '@/app/components/PaymentConfirmationModal'

// Interface for the component's FeeEntry type (different from database FeeEntry)
interface ComponentFeeEntry {
  id: string
  block: string
  memberName: string
  flatNumber: string
  months: string[]
  fee: string
  totalFee: string
  paymentType: string
  remarks: string
  date: string
  payment_confirmed?: boolean
  payment_confirmed_by?: string
  payment_confirmed_at?: string
  created_by?: string
  user_profiles?: {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
  }
  confirmed_by_user?: {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
  }
}

export default function PaymentConfirmationsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [pendingPayments, setPendingPayments] = useState<ComponentFeeEntry[]>([])
  const [confirmedPayments, setConfirmedPayments] = useState<ComponentFeeEntry[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed'>('pending')

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const [pending, confirmed] = await Promise.all([
        getPendingPayments(),
        getConfirmedPayments()
      ])
      
      // Transform the data to match FeeTable interface
      const transformEntry = (entry: any): ComponentFeeEntry => ({
        id: entry.id,
        block: entry.block,
        memberName: entry.member_name,
        flatNumber: entry.flat_number,
        months: entry.months,
        fee: entry.fee.toString(),
        totalFee: entry.total_fee.toString(),
        paymentType: entry.payment_type,
        remarks: entry.remarks,
        date: new Date(entry.created_at).toLocaleDateString(),
        payment_confirmed: entry.payment_confirmed,
        payment_confirmed_by: entry.payment_confirmed_by,
        payment_confirmed_at: entry.payment_confirmed_at,
        created_by: entry.created_by,
        user_profiles: entry.user_profiles,
        confirmed_by_user: entry.confirmed_by_user
      })

      setPendingPayments(pending.map(transformEntry))
      setConfirmedPayments(confirmed.map(transformEntry))
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentConfirmed = () => {
    loadPayments()
  }

  // Check if user has permission to access this page
  const canAccess = user?.role === 'super_admin' || user?.role === 'colony_admin' || user?.role === 'block_manager'

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">
              You don't have permission to access payment confirmations. Only admins and block managers can manage payment confirmations.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Confirmations</h1>
          <p className="text-gray-600">
            Manage payment confirmations for cash and payment request entries.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Confirmations</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Confirmed Payments</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedPayments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPayments.length + confirmedPayments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Confirmations ({pendingPayments.length})
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'confirmed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Confirmed Payments ({confirmedPayments.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading payments...</span>
              </div>
            ) : (
              <FeeTable
                entries={activeTab === 'pending' ? pendingPayments : confirmedPayments}
                onPaymentConfirmed={handlePaymentConfirmed}
              />
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Payment Confirmation Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Manual Confirmation Required:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Cash Payments:</strong> Require manual confirmation by admin/block manager</li>
                <li>• <strong>Request Payment:</strong> Require manual confirmation after payment is made</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Auto-Confirmed:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>UPI Payments:</strong> Automatically confirmed (digital proof)</li>
                <li>• <strong>Card Payments:</strong> Automatically confirmed (digital proof)</li>
                <li>• <strong>Bank Transfer:</strong> Automatically confirmed (digital proof)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 