'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'
import { getFeeEntries, getMemberByUserId } from '@/lib/database'
import { FeeEntry } from '@/types/database'

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
}

export default function AllEntriesPage() {
  console.log('AllEntriesPage component rendered')
  const { user, loading } = useAuth()
  const router = useRouter()
  const [entries, setEntries] = useState<LocalFeeEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPaymentType, setFilterPaymentType] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'member'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to login')
      router.push('/login')
    } else if (!loading && user) {
      console.log('User found:', { email: user.email, role: user.role })
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadAllEntries()
    }
  }, [user])

  const loadAllEntries = async () => {
    try {
      setLoadingEntries(true)
      let dbEntries = await getFeeEntries()
      
      // Filter entries for residents - show only their own entries
      if (user && user.role === 'resident') {
        const member = await getMemberByUserId(user.id)
        if (member) {
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
        date: new Date(dbEntry.created_at).toLocaleDateString()
      }))
      
      setEntries(localEntries)
    } catch (error) {
      console.error('Error loading fee entries:', error)
    } finally {
      setLoadingEntries(false)
    }
  }

  // Filter and sort entries
  const filteredAndSortedEntries = entries
    .filter(entry => {
      const matchesSearch = 
        entry.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.paymentType.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesPaymentType = filterPaymentType === '' || entry.paymentType === filterPaymentType
      
      return matchesSearch && matchesPaymentType
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'amount':
          comparison = parseFloat(a.totalFee) - parseFloat(b.totalFee)
          break
        case 'member':
          comparison = a.memberName.localeCompare(b.memberName)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const paymentTypes = ['UPI', 'IMPS', 'Card', 'Cash', 'Bank Transfer']

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

            {/* Filters and Search */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search by member, block, flat, or payment type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Payment Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                  <select
                    value={filterPaymentType}
                    onChange={(e) => setFilterPaymentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Payment Types</option>
                    {paymentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'member')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="member">Member Name</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Entries Table */}
            <div className="overflow-x-auto">
              {loadingEntries ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading entries...</span>
                </div>
              ) : filteredAndSortedEntries.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No entries found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterPaymentType 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'No fee entries have been recorded yet.'
                    }
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Block & Flat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Months
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{entry.memberName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{entry.block}</div>
                          <div className="text-sm text-gray-500">Flat {entry.flatNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {entry.months.join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{entry.totalFee}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            entry.paymentType === 'Cash' ? 'bg-green-100 text-green-800' :
                            entry.paymentType === 'UPI' ? 'bg-blue-100 text-blue-800' :
                            entry.paymentType === 'Card' ? 'bg-purple-100 text-purple-800' :
                            entry.paymentType === 'Bank Transfer' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.paymentType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.date}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={entry.remarks}>
                            {entry.remarks || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Summary */}
            {filteredAndSortedEntries.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {filteredAndSortedEntries.length} of {entries.length} entries
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Total Amount: ₹{filteredAndSortedEntries.reduce((sum, entry) => sum + parseFloat(entry.totalFee), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 