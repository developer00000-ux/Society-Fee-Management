'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFeeEntries, getMemberByUserId, deleteFeeEntry } from '@/lib/database'
import { FeeEntry } from '@/types/database'
import { useAuth } from '@/lib/contexts/AuthContext'
import FeeTable from './FeeTable'

interface LocalFeeEntry {
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
  feeTypes?: string[]
  status?: 'pending' | 'success' | 'failed' | 'refunded'
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

interface SharedFeeEntriesProps {
  mode: 'resident' | 'block_manager'
  title?: string
  subtitle?: string
  showCreateButton?: boolean
  onCreateClick?: () => void
  showDeleteButton?: boolean
  onEntryDeleted?: () => void
  showPaymentButton?: boolean
  onPaymentClick?: () => void
}

export default function SharedFeeEntries({ 
  mode, 
  title, 
  subtitle, 
  showCreateButton = false, 
  onCreateClick,
  showDeleteButton = false,
  onEntryDeleted,
  showPaymentButton = false,
  onPaymentClick
}: SharedFeeEntriesProps) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LocalFeeEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Load existing entries from database
  useEffect(() => {
    loadEntries()
  }, [user])

  const loadEntries = async () => {
    try {
      setLoading(true)
      let dbEntries = await getFeeEntries()
      
      // Filter entries for residents - show only their own entries
      if (mode === 'resident' && user && user.role === 'resident') {
        const member = await getMemberByUserId(user.id)
        if (member) {
          // Filter entries by member name for residents
          dbEntries = dbEntries.filter(entry => 
            entry.member_name === member.name
          )
        }
      }
      
      const localEntries: LocalFeeEntry[] = dbEntries.map(dbEntry => ({
        id: dbEntry.id,
        block: dbEntry.block,
        memberName: dbEntry.member_name,
        flatNumber: dbEntry.flat_number,
        months: dbEntry.months,
        fee: dbEntry.fee.toString(),
        totalFee: dbEntry.total_fee.toString(),
        paymentType: dbEntry.payment_type,
        remarks: dbEntry.remarks,
        date: new Date(dbEntry.created_at).toLocaleDateString(),
        status: dbEntry.status || 'pending',
        payment_confirmed: dbEntry.payment_confirmed || false,
        payment_confirmed_by: dbEntry.payment_confirmed_by,
        payment_confirmed_at: dbEntry.payment_confirmed_at,
        created_by: dbEntry.created_by,
        user_profiles: dbEntry.created_by_user,
        confirmed_by_user: dbEntry.confirmed_by_user
      }))
      setEntries(localEntries)
    } catch (error) {
      console.error('Error loading fee entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee entry?')) return

    try {
      await deleteFeeEntry(id)
      await loadEntries()
      if (onEntryDeleted) {
        onEntryDeleted()
      }
    } catch (error) {
      console.error('Error deleting fee entry:', error)
      alert('Error deleting fee entry. Please try again.')
    }
  }

  const handleEntryCreated = () => {
    loadEntries()
  }

  const defaultTitle = mode === 'resident' ? 'Your Fee Entries' : 'All Fee Entries'
  const defaultSubtitle = mode === 'resident' 
    ? 'Showing only your fee payment history' 
    : 'Complete list of all fee entries in the system'

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {title || defaultTitle}
            </h2>
            <p className="text-base text-gray-600">
              {subtitle || defaultSubtitle}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            
            {/* Make Payment Button */}
            {showPaymentButton && onPaymentClick && (
              <button
                onClick={onPaymentClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Make Payment
              </button>
            )}
            
            {/* See All Entries Link for Residents */}
            {mode === 'resident' && user && user.role === 'resident' && (
              <Link
                href="/entries/all"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                See All Entries
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading fee entries...</p>
        </div>
      )}

      {/* Fee Table */}
      {!loading && (
        <FeeTable 
          entries={entries} 
          showDeleteButton={showDeleteButton}
          onDelete={handleDelete}
          onPaymentConfirmed={handleEntryCreated}
        />
      )}
    </div>
  )
} 