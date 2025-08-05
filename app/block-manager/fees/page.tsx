'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFeeEntries, deleteFeeEntry, getBlocks, getMembers, getFlats, getActiveFeeTypes, createFeeEntry } from '@/lib/database'
import { FeeEntry, Block, Member, Flat, FeeType } from '@/types/database'
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../components/ProtectedRoute'

interface SelectedFeeType {
  feeType: FeeType
  quantity: number
}

export default function BlockManagerFeesPage() {
  const [feeEntries, setFeeEntries] = useState<FeeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [buildings, setBuildings] = useState<Block[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [flats, setFlats] = useState<Flat[]>([])
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([])
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<SelectedFeeType[]>([])
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    block: '',
    memberName: '',
    flatNumber: '',
    selectedMonths: [] as string[],
    paymentType: '',
    remarks: ''
  })

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const paymentTypes = ['UPI', 'IMPS', 'Card', 'Cash', 'Bank Transfer']

  useEffect(() => {
    loadFeeEntries()
    loadFormData()
  }, [])

  const loadFormData = async () => {
    try {
      const [buildingsData, membersData, flatsData, feeTypesData] = await Promise.all([
        getBlocks(),
        getMembers(),
        getFlats(),
        getActiveFeeTypes()
      ])
      setBuildings(buildingsData)
      setMembers(membersData)
      setFlats(flatsData)
      setFeeTypes(feeTypesData)
    } catch (error) {
      console.error('Error loading form data:', error)
    }
  }

  const loadFeeEntries = async () => {
    try {
      const data = await getFeeEntries()
      setFeeEntries(data)
    } catch (error) {
      console.error('Error loading fee entries:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee entry?')) return

    try {
      await deleteFeeEntry(id)
      await loadFeeEntries()
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
    return selectedFeeTypes.reduce((total, item) => {
      return total + (item.feeType.amount * item.quantity)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedFeeTypes.length === 0) {
      alert('Please select at least one fee type.')
      return
    }

    setSubmitting(true)
    
    try {
      const totalFee = calculateTotalFee()
      const feeTypeNames = selectedFeeTypes.map(item => 
        `${item.feeType.name} (${item.quantity}x)`
      ).join(', ')

      // Create entry in database
      await createFeeEntry({
        block: formData.block,
        member_name: formData.memberName,
        flat_number: formData.flatNumber,
        months: formData.selectedMonths,
        fee: totalFee,
        total_fee: totalFee,
        payment_type: formData.paymentType,
        remarks: `${formData.remarks}\nFee Types: ${feeTypeNames}`.trim()
      })

      // Reset form and reload entries
      setFormData({
        block: '',
        memberName: '',
        flatNumber: '',
        selectedMonths: [],
        paymentType: '',
        remarks: ''
      })
      setSelectedFeeTypes([])
      setShowForm(false)
      await loadFeeEntries()
      alert('Fee entry created successfully!')
    } catch (error) {
      console.error('Error submitting fee entry:', error)
      alert('Error creating fee entry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      block: '',
      memberName: '',
      flatNumber: '',
      selectedMonths: [],
      paymentType: '',
      remarks: ''
    })
    setSelectedFeeTypes([])
    setShowForm(false)
  }

  return (
    <ProtectedRoute requiredRoles={['block_manager']}>
      <div>
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Fee Entries Management</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {showForm ? 'Cancel' : 'Create New Entry'}
              </button>
              <Link href="/block-manager/dashboard" className="text-gray-600 hover:text-gray-800">
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Create Fee Entry Form */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Create Fee Entry</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Building Dropdown */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Building</label>
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

                {/* Month Selection */}
                <div>
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

                {/* Fee Types Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Select Fee Types</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {feeTypes.map(feeType => (
                      <div
                        key={feeType.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedFeeTypes.find(item => item.feeType.id === feeType.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handleFeeTypeToggle(feeType)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{feeType.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{feeType.description}</p>
                            <p className="text-lg font-bold text-blue-600 mt-2">₹{feeType.amount.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {selectedFeeTypes.find(item => item.feeType.id === feeType.id) && (
                              <input
                                type="number"
                                min="1"
                                value={selectedFeeTypes.find(item => item.feeType.id === feeType.id)?.quantity || 1}
                                onChange={(e) => handleQuantityChange(feeType.id, parseInt(e.target.value) || 1)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Fee Types Summary */}
                {selectedFeeTypes.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Selected Fee Types:</h3>
                    <div className="space-y-2">
                      {selectedFeeTypes.map(item => (
                        <div key={item.feeType.id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">
                            {item.feeType.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{(item.feeType.amount * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total:</span>
                          <span className="text-lg font-bold text-blue-600">₹{calculateTotalFee().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Remarks Textarea */}
                <div>
                  <label className="block text-sm font-medium mb-2">Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    rows={3}
                    placeholder="Enter any remarks..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedFeeTypes.length === 0 || submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating...' : 'Create Entry'}
                  </button>
                </div>
              </form>
            </div>
          )}

                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">All Fee Entries</h2>
                  <div className="text-sm text-gray-600">
                    Total Entries: {feeEntries.length}
                  </div>
                </div>
              </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Block
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Flat Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Months
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {entry.block}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {entry.member_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {entry.flat_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {entry.months.join(', ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
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
                          entry.payment_type === 'cash' ? 'bg-green-100 text-green-800' :
                          entry.payment_type === 'online' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.payment_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {entry.remarks || '-'}
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
              {feeEntries.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                  No fee entries found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 