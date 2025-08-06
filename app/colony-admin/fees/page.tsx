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

export default function ColonyAdminFeesPage() {
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
      const isSelected = prev.some(st => st.feeType.id === feeType.id)
      if (isSelected) {
        return prev.filter(st => st.feeType.id !== feeType.id)
      } else {
        return [...prev, { feeType, quantity: 1 }]
      }
    })
  }

  const handleQuantityChange = (feeTypeId: string, quantity: number) => {
    setSelectedFeeTypes(prev => 
      prev.map(st => 
        st.feeType.id === feeTypeId 
          ? { ...st, quantity: Math.max(1, quantity) }
          : st
      )
    )
  }

  const calculateTotalFee = () => {
    return selectedFeeTypes.reduce((total, st) => {
      return total + (st.feeType.amount * st.quantity)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const totalFee = selectedFeeTypes.reduce((sum, st) => sum + (st.feeType.amount * st.quantity), 0)
      
      const feeEntryData = {
        block: getBlockName(formData.block),
        member_name: getMemberName(formData.memberName),
        flat_number: getFlatNumber(formData.flatNumber),
        months: formData.selectedMonths,
        fee: selectedFeeTypes.reduce((sum, st) => sum + st.feeType.amount, 0),
        total_fee: totalFee,
        payment_type: formData.paymentType,
        remarks: formData.remarks
      }

      await createFeeEntry(feeEntryData)
      resetForm()
      await loadFeeEntries()
      alert('Fee entry created successfully!')
    } catch (error) {
      console.error('Error creating fee entry:', error)
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

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member ? member.name : 'Unknown Member'
  }

  const getFlatNumber = (flatId: string) => {
    const flat = flats.find(f => f.id === flatId)
    return flat ? flat.flat_number : 'Unknown Flat'
  }

  const getBlockName = (blockId: string) => {
    const block = buildings.find(b => b.id === blockId)
    return block ? block.block_name : 'Unknown Block'
  }

  return (
    <ProtectedRoute requiredRoles={['colony_admin']}>
      <div>
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Fee Entries Management</h1>
            <Link href="/colony-admin/dashboard" className="text-gray-600 hover:text-gray-800">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Add Fee Entry Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-6 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Add New Fee Entry
            </button>
          )}

          {/* Add Fee Entry Form */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Add New Fee Entry</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Block</label>
                    <select
                      value={formData.block}
                      onChange={(e) => handleInputChange('block', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      required
                    >
                      <option value="">Select a block</option>
                      {buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                          Block {building.block_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Member</label>
                    <select
                      value={formData.memberName}
                      onChange={(e) => handleInputChange('memberName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      required
                    >
                      <option value="">Select a member</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Flat</label>
                    <select
                      value={formData.flatNumber}
                      onChange={(e) => handleInputChange('flatNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      required
                    >
                      <option value="">Select a flat</option>
                      {flats.map((flat) => (
                        <option key={flat.id} value={flat.id}>
                          Flat {flat.flat_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Payment Type</label>
                    <select
                      value={formData.paymentType}
                      onChange={(e) => handleInputChange('paymentType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      required
                    >
                      <option value="">Select payment type</option>
                      {paymentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-full">
                    <label className="block text-sm font-medium mb-2">Remarks</label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => handleInputChange('remarks', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      rows={3}
                      placeholder="Optional remarks"
                    />
                  </div>
                </div>

                {/* Months Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Months</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {months.map((month) => (
                      <label key={month} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.selectedMonths.includes(month)}
                          onChange={() => handleMonthToggle(month)}
                          className="mr-2"
                        />
                        <span className="text-sm">{month}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fee Types Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Fee Types</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {feeTypes.map((feeType) => (
                      <div key={feeType.id} className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={selectedFeeTypes.some(st => st.feeType.id === feeType.id)}
                            onChange={() => handleFeeTypeToggle(feeType)}
                            className="mr-2"
                          />
                          <span className="font-medium">{feeType.name}</span>
                        </label>
                        {selectedFeeTypes.some(st => st.feeType.id === feeType.id) && (
                          <div className="ml-6">
                            <label className="block text-sm text-gray-600 mb-1">Quantity:</label>
                            <input
                              type="number"
                              min="1"
                              value={selectedFeeTypes.find(st => st.feeType.id === feeType.id)?.quantity || 1}
                              onChange={(e) => handleQuantityChange(feeType.id, parseInt(e.target.value) || 1)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <span className="text-sm text-gray-500 ml-2">
                              Amount: ₹{feeType.amount}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Calculation */}
                {selectedFeeTypes.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Total Calculation</h3>
                    {selectedFeeTypes.map((st) => (
                      <div key={st.feeType.id} className="flex justify-between text-sm">
                        <span>{st.feeType.name} (x{st.quantity})</span>
                        <span>₹{st.feeType.amount * st.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-300 mt-2 pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span>₹{calculateTotalFee()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting || selectedFeeTypes.length === 0 || formData.selectedMonths.length === 0}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors disabled:bg-gray-400"
                  >
                    {submitting ? 'Creating...' : 'Create Fee Entry'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Fee Entries List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Existing Fee Entries</h2>
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
                      Payment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                          {entry.member_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {entry.block}
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
                          {entry.payment_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          ₹{entry.total_fee}
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
                  No fee entries found. Add your first fee entry to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 