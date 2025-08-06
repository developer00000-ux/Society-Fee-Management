'use client'

import React, { useState, useEffect } from 'react'
import { createFeeEntry, getBlocks, getMembers, getFlats, getActiveFeeTypes, getMonthlyFeeStructures, getMemberByUserId, getBuildingById, getFlatById } from '@/lib/database'
import { FeeEntry, Building, Member, Flat, Block, FeeType } from '@/types/database'
import { useAuth } from '@/lib/contexts/AuthContext'
import PaymentRequestModal from './PaymentRequestModal'

interface LocalFeeEntry {
  id: string
  block: string
  memberName: string
  flatNumber: string
  months: string[]
  fee: string
  totalFee: string
  paymentType: string
  dateOfPayment: string
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
    dateOfPayment: '',
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
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentFeeEntry, setCurrentFeeEntry] = useState<LocalFeeEntry | null>(null)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showFeeTypeDropdown, setShowFeeTypeDropdown] = useState(false)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Close month dropdown if clicking outside
      if (showMonthDropdown && !target.closest('[data-month-dropdown]')) {
        setShowMonthDropdown(false)
      }
      
      // Close fee type dropdown if clicking outside
      if (showFeeTypeDropdown && !target.closest('[data-fee-type-dropdown]')) {
        setShowFeeTypeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMonthDropdown, showFeeTypeDropdown])

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const paymentTypes = !user 
    ? ['UPI', 'IMPS', 'Card', 'Cash', 'Bank Transfer']
    : user.role === 'resident' 
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
      if (!user?.id) {
        console.log('No user ID available for auto-fill')
        return
      }

      console.log('Attempting to auto-fill form for user:', user.id)

      // Get member data for the current user
      const member = await getMemberByUserId(user.id)
      console.log('Member data retrieved:', member)
      
      if (!member) {
        console.log('No member record found for user ID:', user.id)
        return
      }

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
      console.log('Form auto-filled successfully')
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
    let totalFee = 0
    
    // Calculate fees from monthly fee structures (built-in fees)
    const monthlyStructureFees = formData.selectedMonths.reduce((total, month) => {
      const structure = monthlyStructures.find(s => s.month === month)
      return total + (structure ? structure.fee_types.reduce((sum, ft) => sum + ft.amount, 0) : 0)
    }, 0)
    
    // Calculate fees from selected fee types (multiplied by number of selected months)
    const selectedFeeTypeFees = selectedFeeTypes.reduce((total, selected) => {
      return total + (selected.feeType.amount * selected.quantity * formData.selectedMonths.length)
    }, 0)
    
    totalFee = monthlyStructureFees + selectedFeeTypeFees
    return totalFee
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
      
      // Create entry in database
      const dbEntry = await createFeeEntry({
        block: formData.block,
        member_name: formData.memberName,
        flat_number: formData.flatNumber,
        months: formData.selectedMonths,
        fee: totalFee,
        total_fee: totalFee,
        payment_type: formData.paymentType,
        date_of_payment: formData.dateOfPayment,
        remarks: formData.remarks,
        created_by: user?.id
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
        dateOfPayment: formData.dateOfPayment,
        remarks: dbEntry.remarks,
        date: new Date().toLocaleDateString(),
        feeTypes: [
          ...formData.selectedMonths.map(month => {
            const structure = monthlyStructures.find(s => s.month === month)
            return structure ? `${month}: ${structure.fee_types.map(ft => ft.fee_type_name).join(', ')}` : month
          }),
          ...selectedFeeTypes.map(selected => 
            `${selected.feeType.name} (₹${selected.feeType.amount} × ${selected.quantity} × ${formData.selectedMonths.length} months)`
          )
        ]
      }

      // If payment type is "Request Payment", show the payment modal
      if (formData.paymentType === 'Request Payment') {
        setCurrentFeeEntry(newEntry)
        setShowPaymentModal(true)
        setLoading(false)
        return
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
        dateOfPayment: '',
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

          {/* Date of Payment */}
          <div>
            <label className="block text-sm font-medium mb-2">Date of Payment</label>
            <input
              type="date"
              value={formData.dateOfPayment}
              onChange={(e) => handleInputChange('dateOfPayment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>
                    <div className='relative' data-month-dropdown>
            <label className="block text-sm font-medium mb-2">Select Months</label>
            
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer bg-white flex items-center justify-between" onClick={() => setShowMonthDropdown(!showMonthDropdown)}>
               <span className="text-gray-700">Select Months</span>
               <svg className={`w-4 h-4 transition-transform text-gray-400 ${showMonthDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
            </div>
            
            {showMonthDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 rounded-md bg-white shadow-lg z-10 max-h-48 overflow-y-auto">
                {months.map(month => (
                  <label key={month} className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.selectedMonths.includes(month)}
                      onChange={() => handleMonthToggle(month)}
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700">{month}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Fee Types Dropdown */}
          <div className='relative' data-fee-type-dropdown>
            <label className="block text-sm font-medium mb-2">Select Fee Types</label>
            
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer bg-white flex items-center justify-between" onClick={() => setShowFeeTypeDropdown(!showFeeTypeDropdown)}>
               <span className="text-gray-700">Select Fee Types</span>
               <svg className={`w-4 h-4 transition-transform text-gray-400 ${showFeeTypeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
            </div>
            
            {showFeeTypeDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 rounded-md bg-white shadow-lg z-10 max-h-48 overflow-y-auto">
                {feeTypes.map(feeType => (
                  <label key={feeType.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFeeTypes.some(selected => selected.feeType.id === feeType.id)}
                      onChange={() => handleFeeTypeToggle(feeType)}
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-sm text-gray-700">{feeType.name}</span>
                      <span className="text-sm font-medium text-green-600">₹{feeType.amount}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Selected Months Fee Summary */}
        {(formData.selectedMonths.length > 0 || selectedFeeTypes.length > 0) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Fee Breakdown:</h3>
            <div className="space-y-4">
              {/* Monthly Fee Structures */}
              {formData.selectedMonths.map(month => {
                const structure = monthlyStructures.find(s => s.month === month)
                if (!structure || structure.fee_types.length === 0) return null
                
                return (
                  <div key={month} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="font-semibold text-gray-900 mb-2">{month}</div>
                    <div className="space-y-1">
                      {structure.fee_types.map((feeType, index) => (
                        <div key={index} className="flex justify-between items-center text-sm py-1">
                          <span className="text-gray-700">
                            {feeType.fee_type_name}
                            {feeType.is_required && <span className="text-red-600 ml-1">*</span>}
                          </span>
                          <span className="font-medium text-green-600">₹{feeType.amount}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-2 pt-2">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="text-blue-600">₹{structure.fee_types.reduce((sum, ft) => sum + ft.amount, 0)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Selected Fee Types */}
              {selectedFeeTypes.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="font-semibold text-gray-900 mb-2">Additional Fees for {formData.selectedMonths.join(', ')}</div>
                  <div className="space-y-1">
                    {selectedFeeTypes.map((selected, index) => (
                      <div key={index} className="flex justify-between items-center text-sm py-1">
                        <span className="text-gray-700">
                          {selected.feeType.name}
                        </span>
                        <span className="font-medium text-green-600">
                          ₹{selected.feeType.amount * selected.quantity * formData.selectedMonths.length}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="text-blue-600">
                        ₹{selectedFeeTypes.reduce((sum, selected) => 
                          sum + (selected.feeType.amount * selected.quantity * formData.selectedMonths.length), 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Amount */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
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

      {/* Payment Request Modal */}
      {currentFeeEntry && (
        <PaymentRequestModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setCurrentFeeEntry(null)
            // Reset form after payment request
            setFormData({
              block: '',
              memberName: '',
              flatNumber: '',
              selectedMonths: [],
              paymentType: '',
              dateOfPayment: '',
              remarks: ''
            })
            setSelectedFeeTypes([])
            if (onClose) {
              onClose()
            }
          }}
          feeEntry={{
            memberName: currentFeeEntry.memberName,
            flatNumber: currentFeeEntry.flatNumber,
            block: currentFeeEntry.block,
            totalFee: parseFloat(currentFeeEntry.totalFee),
            months: currentFeeEntry.months,
            remarks: currentFeeEntry.remarks
          }}
        />
      )}
    </div>
  )
} 