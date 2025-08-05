'use client'

import React, { useState, useEffect } from 'react'
import { createFeeEntry, getBlocks, getMembers, getFlats, getActiveFeeTypes, getMonthlyFeeStructures, getMemberByUserId, getBuildingById, getFlatById } from '@/lib/database'
import { FeeEntry, Building, Member, Flat, Block, FeeType } from '@/types/database'
import { useAuth } from '@/lib/contexts/AuthContext'

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

interface SelectedFeeType {
  feeType: FeeType
  quantity: number
}

interface MonthlyFeeStructure {
  id?: string
  month: string
  year: number
  fee_types: MonthlyFeeType[]
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface MonthlyFeeType {
  fee_type_id: string
  fee_type_name: string
  amount: number
  is_required: boolean
  description?: string
}

interface SharedFeeEntryFormProps {
  mode: 'resident' | 'block_manager'
  onEntryCreated?: (entry: LocalFeeEntry) => void
  onClose?: () => void
}

export default function SharedFeeEntryForm({ mode, onEntryCreated, onClose }: SharedFeeEntryFormProps) {
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    block: '',
    memberName: '',
    flatNumber: '',
    selectedMonths: [] as string[],
    paymentType: '',
    remarks: ''
  })

  const [loading, setLoading] = useState(false)
  const [buildings, setBuildings] = useState<Block[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [flats, setFlats] = useState<Flat[]>([])
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([])
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<SelectedFeeType[]>([])
  const [monthlyStructures, setMonthlyStructures] = useState<MonthlyFeeStructure[]>([])
  const [autoFilled, setAutoFilled] = useState(false)
  const [useMonthlyStructures, setUseMonthlyStructures] = useState(true)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const paymentTypes = user?.role === 'resident' 
    ? ['UPI', 'IMPS', 'Card', 'Cash', 'Bank Transfer']
    : ['UPI', 'IMPS', 'Card', 'Cash', 'Bank Transfer', 'Request Payment']

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [buildingsData, membersData, flatsData, feeTypesData, monthlyStructuresData] = await Promise.all([
        getBlocks(),
        getMembers(),
        getFlats(),
        getActiveFeeTypes(),
        getMonthlyFeeStructures()
      ])
      setBuildings(buildingsData)
      setMembers(membersData)
      setFlats(flatsData)
      setFeeTypes(feeTypesData)
      setMonthlyStructures(monthlyStructuresData)

      // Auto-fill form for residents
      if (mode === 'resident' && user && user.role === 'resident' && !autoFilled) {
        await autoFillFormForResident()
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const autoFillFormForResident = async () => {
    try {
      if (!user?.id) return

      // Get member data for the current user
      const member = await getMemberByUserId(user.id)
      if (!member) return

      // Get building data
      let buildingName = ''
      if (member.block_id) {
        const building = await getBuildingById(member.block_id)
        if (building) {
          buildingName = building.block_name
        }
      }

      // Get flat data
      let flatNumber = ''
      if (member.flat_id) {
        const flat = await getFlatById(member.flat_id)
        if (flat) {
          flatNumber = flat.flat_number
        }
      }

      // Auto-fill the form
      setFormData(prev => ({
        ...prev,
        block: buildingName,
        memberName: member.name,
        flatNumber: flatNumber
      }))
      setAutoFilled(true)
    } catch (error) {
      console.error('Error auto-filling form for resident:', error)
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

  const handleFeeTypeToggle = (feeType: FeeType) => {
    setSelectedFeeTypes(prev => {
      const existing = prev.find(item => item.feeType.id === feeType.id)
      if (existing) {
        return prev.filter(item => item.feeType.id !== feeType.id)
      } else {
        return [...prev, { feeType, quantity: 1 }]
      }
    })
  }

  const handleQuantityChange = (feeTypeId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedFeeTypes(prev => prev.filter(item => item.feeType.id !== feeTypeId))
    } else {
      setSelectedFeeTypes(prev => 
        prev.map(item => 
          item.feeType.id === feeTypeId 
            ? { ...item, quantity } 
            : item
        )
      )
    }
  }

  const calculateTotalFee = () => {
    return formData.selectedMonths.reduce((total, month) => {
      const structure = monthlyStructures.find(s => s.month === month)
      return total + (structure ? structure.fee_types.reduce((sum, ft) => sum + ft.amount, 0) : 0)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.selectedMonths.length === 0) {
      alert('Please select at least one month.')
      return
    }

    setLoading(true)
    
    try {
      const totalFee = calculateTotalFee()
      
      const feeTypeNames = formData.selectedMonths.map(month => {
        const structure = monthlyStructures.find(s => s.month === month)
        if (!structure) return month
        return `${month}: ${structure.fee_types.map(ft => `${ft.fee_type_name} (₹${ft.amount})`).join(', ')}`
      }).join('; ')

      // Create entry in database
      const dbEntry = await createFeeEntry({
        block: formData.block,
        member_name: formData.memberName,
        flat_number: formData.flatNumber,
        months: formData.selectedMonths,
        fee: totalFee,
        total_fee: totalFee,
        payment_type: formData.paymentType,
        remarks: `${formData.remarks}\nMonthly Fee Structure: ${feeTypeNames}`.trim()
      })

      // Create local entry for display
      const newEntry: LocalFeeEntry = {
        id: dbEntry.id,
        block: dbEntry.block,
        memberName: dbEntry.member_name,
        flatNumber: dbEntry.flat_number,
        months: dbEntry.months,
        fee: totalFee.toString(),
        totalFee: totalFee.toString(),
        paymentType: dbEntry.payment_type,
        remarks: dbEntry.remarks,
        date: new Date().toLocaleDateString(),
        feeTypes: formData.selectedMonths.map(month => {
          const structure = monthlyStructures.find(s => s.month === month)
          return structure ? `${month}: ${structure.fee_types.map(ft => ft.fee_type_name).join(', ')}` : month
        })
      }

      if (onEntryCreated) {
        onEntryCreated(newEntry)
      }
      
      // Reset form
      setFormData({
        block: '',
        memberName: '',
        flatNumber: '',
        selectedMonths: [],
        paymentType: '',
        remarks: ''
      })
      setSelectedFeeTypes([])
      
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error('Error submitting fee entry:', error)
      if (error instanceof Error && error.message.includes('Supabase is not configured')) {
        alert('Database not configured. Please set up your Supabase credentials in .env.local file.')
      } else {
        alert('Error submitting fee entry. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const totalFee = calculateTotalFee()

  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key'

  return (
    <div className="max-w-4xl mx-auto p-6">
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
          {/* Building Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Building</label>
            {mode === 'resident' && autoFilled ? (
              <input
                type="text"
                value={formData.block}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                required
              />
            ) : (
              <select
                value={formData.block}
                onChange={(e) => handleInputChange('block', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              >
                <option value="">Select Building</option>
                {buildings.map(building => (
                  <option key={building.id} value={building.block_name}>{building.block_name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Member Name Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Member Name</label>
            {mode === 'resident' && autoFilled ? (
              <input
                type="text"
                value={formData.memberName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                required
              />
            ) : (
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
            )}
          </div>

          {/* Flat Number Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Flat Number</label>
            {mode === 'resident' && autoFilled ? (
              <input
                type="text"
                value={formData.flatNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                required
              />
            ) : (
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
            )}
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Payment Type</label>
            <select
              value={formData.paymentType}
              onChange={(e) => handleInputChange('paymentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            >
              <option value="">Select Payment Type</option>
              {paymentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>



        {/* Monthly Fee Structure Selection */}
        {useMonthlyStructures && (
          <div className="mt-6">
            <label className="block text-sm font-medium mb-3">Select Months with Predefined Fee Structure</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {monthlyStructures.map(structure => (
                <button
                  key={structure.id}
                  type="button"
                  onClick={() => handleMonthToggle(structure.month)}
                  className={`px-4 py-2 border rounded-md transition-colors text-sm relative ${
                    formData.selectedMonths.includes(structure.month)
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium">{structure.month}</div>
                    <div className="text-xs opacity-75">
                      ₹{structure.fee_types.reduce((sum, ft) => sum + ft.amount, 0)}
                    </div>
                    <div className="text-xs opacity-60">
                      {structure.fee_types.length} fees
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {formData.selectedMonths.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                Selected: {formData.selectedMonths.join(', ')}
              </div>
            )}
          </div>
        )}




        {/* Selected Months Fee Summary */}
        {useMonthlyStructures && formData.selectedMonths.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Selected Months Fee Breakdown:</h3>
            <div className="space-y-3">
              {formData.selectedMonths.map(month => {
                const structure = monthlyStructures.find(s => s.month === month)
                if (!structure) return null
                
                return (
                  <div key={month} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{month}</span>
                      <span className="text-lg font-bold text-blue-600">
                        ₹{structure.fee_types.reduce((sum, ft) => sum + ft.amount, 0)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {structure.fee_types.map((feeType, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            {feeType.fee_type_name}
                            {feeType.is_required && <span className="text-red-600 ml-1">*</span>}
                          </span>
                          <span className="font-medium">₹{feeType.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ₹{totalFee.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}



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
            disabled={
              formData.selectedMonths.length === 0 || loading
            }
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Fee Entry'}
          </button>
        </div>
      </form>
    </div>
  )
} 