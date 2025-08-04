'use client'

import React, { useState, useEffect } from 'react'
import FeeTable from './FeeTable'
import { createFeeEntry, getFeeEntries, getBlocks, getMembers, getFlats } from '@/lib/database'
import { FeeEntry, Block, Member, Flat } from '@/types/database'

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
}

export default function UserForm() {
  const [formData, setFormData] = useState({
    block: '',
    memberName: '',
    flatNumber: '',
    selectedMonths: [] as string[],
    fee: '',
    paymentType: '',
    remarks: ''
  })

  const [entries, setEntries] = useState<LocalFeeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [flats, setFlats] = useState<Flat[]>([])

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const paymentTypes = ['UPI', 'IMPS', 'Card', 'Cash', 'Bank Transfer']

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
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
      console.error('Error loading data:', error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Create entry in database
      const dbEntry = await createFeeEntry({
        block: formData.block,
        member_name: formData.memberName,
        flat_number: formData.flatNumber,
        months: formData.selectedMonths,
        fee: parseFloat(formData.fee),
        total_fee: parseFloat(calculateTotalFee()),
        payment_type: formData.paymentType,
        remarks: formData.remarks
      })

      // Create local entry for display
      const newEntry: LocalFeeEntry = {
        id: dbEntry.id,
        block: dbEntry.block,
        memberName: dbEntry.member_name,
        flatNumber: dbEntry.flat_number,
        months: dbEntry.months,
        fee: formData.fee,
        totalFee: calculateTotalFee(),
        paymentType: dbEntry.payment_type,
        remarks: dbEntry.remarks,
        date: new Date().toLocaleDateString()
      }

      setEntries(prev => [newEntry, ...prev])
      
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
    } catch (error) {
      console.error('Error submitting fee entry:', error)
      if (error instanceof Error && error.message.includes('Supabase is not configured')) {
        alert('Database not configured. Please set up your Supabase credentials in .env.local file. See the warning banner above for instructions.')
      } else {
        alert('Error submitting fee entry. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const totalFee = calculateTotalFee()

  // Load existing entries from database
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const dbEntries = await getFeeEntries()
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
      }
    }

    loadEntries()
  }, [])

  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key'

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Society Fee Management</h1>
      
      {!isSupabaseConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Database Not Configured
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  To save data permanently, you need to set up Supabase. 
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                    Create a project
                  </a>
                  , then update your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file with your credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Block Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2">Block</label>
            <select
              value={formData.block}
              onChange={(e) => handleInputChange('block', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                    ? 'bg-gray-800 text-white border-gray-800'
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
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
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
                    ? 'bg-gray-800 text-white border-gray-800'
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            rows={3}
            placeholder="Enter any remarks..."
          />
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={formData.selectedMonths.length === 0 || loading}
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Fee Entry'}
          </button>
        </div>
      </form>

      {/* Fee Table */}
      <FeeTable entries={entries} />
    </div>
  )
}
