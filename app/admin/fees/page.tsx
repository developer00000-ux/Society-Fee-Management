'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFeeEntries, deleteFeeEntry, createFeeEntry, getBlocks, getMembers, getFlats } from '@/lib/database'
import { FeeEntry, Block, Member, Flat } from '@/types/database'
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../components/ProtectedRoute'

export default function FeesPage() {
  const [entries, setEntries] = useState<FeeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [flats, setFlats] = useState<Flat[]>([])

  const [formData, setFormData] = useState({
    block: '',
    memberName: '',
    flatNumber: '',
    selectedMonths: [] as string[],
    fee: '',
    paymentType: '',
    remarks: ''
  })

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const paymentTypes = ['UPI', 'IMPS', 'Card', 'Cash', 'Bank Transfer']

  useEffect(() => {
    loadEntries()
    loadFormData()
  }, [])

  const loadEntries = async () => {
    try {
      const data = await getFeeEntries()
      setEntries(data)
    } catch (error) {
      console.error('Error loading fee entries:', error)
    }
  }

  const loadFormData = async () => {
    try {
      const [blocksData, membersData, flatsData] = await Promise.all([
        getBlocks(),
        getMembers(),
        getFlats()
      ])
      setBlocks(blocksData)
      setMembers(membersData)
      setFlats(flatsData)
    } catch (error) {
      console.error('Error loading form data:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee entry?')) return

    try {
      await deleteFeeEntry(id)
      await loadEntries()
    } catch (error) {
      console.error('Error deleting fee entry:', error)
      alert('Error deleting fee entry. Please try again.')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMonthToggle = (month: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedMonths.includes(month)
      const newSelectedMonths = isSelected
        ? prev.selectedMonths.filter(m => m !== month)
        : [...prev.selectedMonths, month]
      
      return {
        ...prev,
        selectedMonths: newSelectedMonths
      }
    })
  }

  const calculateTotalFee = () => {
    const feeAmount = parseFloat(formData.fee) || 0
    const monthsCount = formData.selectedMonths.length
    return (feeAmount * monthsCount).toString()
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    
    try {
      await createFeeEntry({
        block: formData.block,
        member_name: formData.memberName,
        flat_number: formData.flatNumber,
        months: formData.selectedMonths,
        fee: parseFloat(formData.fee),
        total_fee: parseFloat(calculateTotalFee()),
        payment_type: formData.paymentType,
        remarks: formData.remarks
      })

      // Reset form
      setFormData({
        block: '',
        memberName: '',
        flatNumber: '',
        selectedMonths: [],
        fee: '',
        paymentType: '',
        remarks: ''
      })

      // Reload entries
      await loadEntries()
      
      // Hide form
      setShowForm(true)
      
      alert('Fee entry created successfully!')
    } catch (error) {
      console.error('Error submitting fee entry:', error)
      alert('Error creating fee entry. Please try again.')
    } finally {
      setFormLoading(true)
    }
  }

  const totalFee = calculateTotalFee()

  return (
    <ProtectedRoute requiredRoles={['super_admin', 'colony_admin', 'block_manager']}>
      <div>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Fee Entries Management</h1>
          <div className="flex items-center gap-4">
       
            <Link href="/admin" className="text-gray-600 hover:text-gray-800">
              ← Back to Admin
            </Link>
          </div>
        </div>

      {/* Fee Entry Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Fee Entry</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Block Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2">Block</label>
                <select
                  value={formData.block}
                  onChange={(e) => handleInputChange('block', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Block</option>
                  {blocks.map(block => (
                    <option key={block.id} value={block.block_name}>Block {block.block_name}</option>
                  ))}
                </select>
              </div>

              {/* Member Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Member Name</label>
                <select
                  value={formData.memberName}
                  onChange={(e) => handleInputChange('memberName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Member</option>
                  {members.map(member => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              {/* Flat Number */}
              <div>
                <label className="block text-sm font-medium mb-2">Flat Number</label>
                <select
                  value={formData.flatNumber}
                  onChange={(e) => handleInputChange('flatNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Flat</option>
                  {flats.map(flat => (
                    <option key={flat.id} value={flat.flat_number}>{flat.flat_number}</option>
                  ))}
                </select>
              </div>

              {/* Fee Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Fee Amount (per month)</label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) => handleInputChange('fee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter fee amount"
                  required
                />
              </div>
            </div>

            {/* Month Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-3">Select Months</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {months.map(month => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthToggle(month)}
                    className={`px-4 py-2 border rounded-md transition-colors text-sm ${
                      formData.selectedMonths.includes(month)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
              {formData.selectedMonths.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  Selected: {formData.selectedMonths.join(', ')}
                </div>
              )}
            </div>

            {/* Total Fee Display */}
            {formData.selectedMonths.length > 0 && formData.fee && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Fee:</span>
                  <span className="text-lg font-bold">₹{totalFee}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formData.selectedMonths.length} month(s) × ₹{formData.fee} = ₹{totalFee}
                </div>
              </div>
            )}

            {/* Payment Type Buttons */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-3">Payment Type</label>
              <div className="flex flex-wrap gap-3">
                {paymentTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('paymentType', type)}
                    className={`px-4 py-2 border rounded-md transition-colors ${
                      formData.paymentType === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Remarks Textarea */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
                placeholder="Enter any remarks..."
              />
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex gap-4">
              <button
                type="submit"
                disabled={formData.selectedMonths.length === 0 || formLoading}
                className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {formLoading ? 'Creating...' : 'Confirm Payment & Create Entry'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Entries</p>
              <p className="text-2xl font-semibold text-gray-900">{entries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{entries.reduce((sum, entry) => sum + entry.total_fee, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {entries.filter(entry => {
                  const entryDate = new Date(entry.created_at)
                  const now = new Date()
                  return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unique Members</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(entries.map(entry => entry.member_name)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Entries Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">All Fee Entries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Block
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Months
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {entry.member_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      Block {entry.block}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {entry.flat_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {entry.months.join(', ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      ₹{entry.fee}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{entry.total_fee}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      entry.payment_type === 'Cash' ? 'bg-green-100 text-green-800' :
                      entry.payment_type === 'UPI' ? 'bg-blue-100 text-blue-800' :
                      entry.payment_type === 'Card' ? 'bg-purple-100 text-purple-800' :
                      entry.payment_type === 'Bank Transfer' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.payment_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No fee entries found. Fee entries will appear here once they are created.
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
    </ProtectedRoute>
  )
} 