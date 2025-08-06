'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { updateFeeEntry, getBlocks, getMembers, getFlats, getFeeTypes, updatePaymentStatus, getActiveFeeTypes, getMonthlyFeeStructures } from '@/lib/database'
import { FeeEntry, FeeType } from '@/types/database'

interface EditFeeEntryModalProps {
  isOpen: boolean
  onClose: () => void
  feeEntry: FeeEntry | null
  onEntryUpdated: () => void
}

export default function EditFeeEntryModal({ isOpen, onClose, feeEntry, onEntryUpdated }: EditFeeEntryModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Form data
  const [formData, setFormData] = useState({
    block: '',
    member_name: '',
    flat_number: '',
    selectedMonths: [] as string[],
    payment_type: '',
    remarks: '',
    payment_status: 'pending' as 'pending' | 'success' | 'failed' | 'refunded'
  })

  // Dropdown data
  const [blocks, setBlocks] = useState<string[]>([])
  const [members, setMembers] = useState<string[]>([])
  const [flats, setFlats] = useState<string[]>([])
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([])
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<{ feeType: FeeType; quantity: number }[]>([])
  const [monthlyStructures, setMonthlyStructures] = useState<any[]>([])
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showFeeTypeDropdown, setShowFeeTypeDropdown] = useState(false)

  // Available months
  const availableMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Load dropdown data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDropdownData()
    }
  }, [isOpen])

  // Reset form data when feeEntry changes
  useEffect(() => {
    if (feeEntry) {
      setFormData({
        block: feeEntry.block,
        member_name: feeEntry.member_name,
        flat_number: feeEntry.flat_number,
        selectedMonths: feeEntry.months,
        payment_type: feeEntry.payment_type,
        remarks: feeEntry.remarks || '',
        payment_status: feeEntry.payment_confirmed ? 'success' : 'pending'
      })
      setErrors({})
    }
  }, [feeEntry])

  const loadDropdownData = async () => {
    try {
      const [blocksData, membersData, flatsData, feeTypesData, monthlyStructuresData] = await Promise.all([
        getBlocks(),
        getMembers(),
        getFlats(),
        getActiveFeeTypes(),
        getMonthlyFeeStructures()
      ])

      // Extract string values from the returned objects
      setBlocks(blocksData.map((block: any) => block.block_name || block.name))
      setMembers(membersData.map((member: any) => member.name))
      setFlats(flatsData.map((flat: any) => flat.flat_number))
      setFeeTypes(feeTypesData)
      setMonthlyStructures(monthlyStructuresData)
    } catch (error) {
      console.error('Error loading dropdown data:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.block.trim()) newErrors.block = 'Block is required'
    if (!formData.member_name.trim()) newErrors.member_name = 'Member name is required'
    if (!formData.flat_number.trim()) newErrors.flat_number = 'Flat number is required'
    if (formData.selectedMonths.length === 0) newErrors.months = 'At least one month is required'
    if (!formData.payment_type.trim()) newErrors.payment_type = 'Payment type is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('You must be logged in to edit fee entries')
      return
    }

    // Check if user has permission to edit
    const canEdit = user.role === 'super_admin' || user.role === 'colony_admin' || user.role === 'block_manager'
    if (!canEdit) {
      alert('You do not have permission to edit fee entries')
      return
    }

    if (!validateForm()) {
      return
    }

    if (!feeEntry) {
      alert('No fee entry to edit')
      return
    }

    setLoading(true)

    try {
      // Calculate total fee based on selected months and fee types
      const totalFee = calculateTotalFee()
      
      await updateFeeEntry(feeEntry.id, {
        block: formData.block,
        member_name: formData.member_name,
        flat_number: formData.flat_number,
        months: formData.selectedMonths,
        fee: totalFee,
        total_fee: totalFee,
        payment_type: formData.payment_type,
        remarks: formData.remarks
      })

      // Update payment status separately
      await updatePaymentStatus(feeEntry.id, formData.payment_status, user.id)

      onEntryUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating fee entry:', error)
      alert('Error updating fee entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMonthChange = (month: string) => {
    setFormData(prev => ({
      ...prev,
      selectedMonths: prev.selectedMonths.includes(month)
        ? prev.selectedMonths.filter(m => m !== month)
        : [...prev.selectedMonths, month]
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

  const calculateTotalFee = () => {
    let totalFee = 0
    
    // Calculate fees from monthly fee structures (built-in fees)
    const monthlyStructureFees = formData.selectedMonths.reduce((total, month) => {
      const structure = monthlyStructures.find(s => s.month === month)
      return total + (structure ? structure.fee_types.reduce((sum: number, ft: any) => sum + ft.amount, 0) : 0)
    }, 0)
    
    // Calculate fees from selected fee types (multiplied by number of selected months)
    const selectedFeeTypeFees = selectedFeeTypes.reduce((total, selected) => {
      return total + (selected.feeType.amount * selected.quantity * formData.selectedMonths.length)
    }, 0)
    
    totalFee = monthlyStructureFees + selectedFeeTypeFees
    return totalFee
  }

  if (!isOpen || !feeEntry) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Fee Entry</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Block */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Block *
              </label>
              <select
                value={formData.block}
                onChange={(e) => setFormData(prev => ({ ...prev, block: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.block ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Block</option>
                {blocks.map((block) => (
                  <option key={block} value={block}>
                    {block}
                  </option>
                ))}
              </select>
              {errors.block && <p className="text-red-500 text-sm mt-1">{errors.block}</p>}
            </div>

            {/* Member Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Name *
              </label>
              <select
                value={formData.member_name}
                onChange={(e) => setFormData(prev => ({ ...prev, member_name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.member_name ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Member</option>
                {members.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
              {errors.member_name && <p className="text-red-500 text-sm mt-1">{errors.member_name}</p>}
            </div>

            {/* Flat Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flat Number *
              </label>
              <select
                value={formData.flat_number}
                onChange={(e) => setFormData(prev => ({ ...prev, flat_number: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.flat_number ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Flat</option>
                {flats.map((flat) => (
                  <option key={flat} value={flat}>
                    {flat}
                  </option>
                ))}
              </select>
              {errors.flat_number && <p className="text-red-500 text-sm mt-1">{errors.flat_number}</p>}
            </div>



                         {/* Payment Type */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Payment Type *
               </label>
               <select
                 value={formData.payment_type}
                 onChange={(e) => setFormData(prev => ({ ...prev, payment_type: e.target.value }))}
                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                   errors.payment_type ? 'border-red-500' : 'border-gray-300'
                 }`}
               >
                 <option value="">Select Payment Type</option>
                 <option value="UPI">UPI</option>
                 <option value="IMPS">IMPS</option>
                 <option value="Card">Card</option>
                 <option value="Cash">Cash</option>
                 <option value="Bank Transfer">Bank Transfer</option>
                 <option value="Request Payment">Request Payment</option>
               </select>
               {errors.payment_type && <p className="text-red-500 text-sm mt-1">{errors.payment_type}</p>}
             </div>

                         {/* Payment Status */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Payment Status *
               </label>
               <select
                 value={formData.payment_status}
                 onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value as 'pending' | 'success' | 'failed' | 'refunded' }))}
                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                   errors.payment_status ? 'border-red-500' : 'border-gray-300'
                 }`}
               >
                 <option value="pending">Pending</option>
                 <option value="success">Success</option>
                 <option value="failed">Failed</option>
                 <option value="refunded">Refunded</option>
               </select>
               {errors.payment_status && <p className="text-red-500 text-sm mt-1">{errors.payment_status}</p>}
             </div>

             {/* Fee Types Dropdown */}
             <div className='relative'>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Select Fee Types
               </label>
               
               <div className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white flex items-center justify-between" onClick={() => setShowFeeTypeDropdown(!showFeeTypeDropdown)}>
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

          

          {/* Months */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Months *
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {availableMonths.map((month) => (
                <label key={month} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.selectedMonths.includes(month)}
                    onChange={() => handleMonthToggle(month)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">{month}</span>
                </label>
              ))}
            </div>
            {formData.selectedMonths.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Selected Months:</p>
                <div className="flex flex-wrap gap-1">
                  {formData.selectedMonths.map((month) => (
                    <span key={month} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {month}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {errors.months && <p className="text-red-500 text-sm mt-1">{errors.months}</p>}
          </div>
{/* Current Fee Information */}
<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Fee Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Calculated Total Fee</p>
                <p className="text-lg font-semibold text-green-600">₹{calculateTotalFee().toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Selected Months</p>
                <p className="text-sm font-medium text-gray-900">{formData.selectedMonths.length} month(s)</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Type</p>
                <p className="text-sm font-medium text-gray-900">{formData.payment_type || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  formData.payment_status === 'success' ? 'bg-green-100 text-green-800' :
                  formData.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  formData.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {formData.payment_status}
                </span>
              </div>
            </div>
          </div>
          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter any additional remarks"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 