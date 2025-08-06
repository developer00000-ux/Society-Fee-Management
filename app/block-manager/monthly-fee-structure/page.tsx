'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'
import { getFeeTypes, createMonthlyFeeStructure, updateMonthlyFeeStructure, deleteMonthlyFeeStructure, getMonthlyFeeStructures } from '@/lib/database'
import { FeeType } from '@/types/database'

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

export default function MonthlyFeeStructurePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([])
  const [monthlyStructures, setMonthlyStructures] = useState<MonthlyFeeStructure[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingStructure, setEditingStructure] = useState<MonthlyFeeStructure | null>(null)
  const [showFeeTypesGrid, setShowFeeTypesGrid] = useState(false)
  const [formData, setFormData] = useState<MonthlyFeeStructure>({
    month: '',
    year: new Date().getFullYear(),
    fee_types: [],
    is_active: true
  })

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoadingData(true)
      const [feeTypesData, structuresData] = await Promise.all([
        getFeeTypes(),
        getMonthlyFeeStructures()
      ])
      setFeeTypes(feeTypesData)
      setMonthlyStructures(structuresData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFeeTypeToggle = (feeType: FeeType) => {
    setFormData(prev => {
      const existing = prev.fee_types.find(ft => ft.fee_type_id === feeType.id)
      if (existing) {
        return {
          ...prev,
          fee_types: prev.fee_types.filter(ft => ft.fee_type_id !== feeType.id)
        }
      } else {
        return {
          ...prev,
          fee_types: [...prev.fee_types, {
            fee_type_id: feeType.id,
            fee_type_name: feeType.name,
            amount: feeType.amount,
            is_required: true,
            description: feeType.description
          }]
        }
      }
    })
  }

  const handleFeeTypeChange = (feeTypeId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      fee_types: prev.fee_types.map(ft => 
        ft.fee_type_id === feeTypeId 
          ? { ...ft, [field]: value }
          : ft
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Fee types are now optional, so no validation needed

    try {
      setFormLoading(true)
      
      if (editingStructure) {
        // Update existing structure
        const updatedStructure = await updateMonthlyFeeStructure(editingStructure.id!, {
          month: formData.month,
          year: formData.year,
          fee_types: formData.fee_types,
          is_active: formData.is_active
        })
        
        setMonthlyStructures(prev => 
          prev.map(s => s.id === editingStructure.id ? updatedStructure : s)
        )
      } else {
        // Create new structure
        const newStructure = await createMonthlyFeeStructure({
          month: formData.month,
          year: formData.year,
          fee_types: formData.fee_types,
          is_active: formData.is_active
        })
        
        setMonthlyStructures(prev => [newStructure, ...prev])
      }

             // Reset form
       setFormData({
         month: '',
         year: new Date().getFullYear(),
         fee_types: [],
         is_active: true
       })
       setEditingStructure(null)
       setShowForm(false)
       setShowFeeTypesGrid(false)
      
      alert(editingStructure ? 'Monthly fee structure updated successfully!' : 'Monthly fee structure created successfully!')
    } catch (error) {
      console.error('Error saving monthly fee structure:', error)
      alert('Error saving monthly fee structure. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (structure: MonthlyFeeStructure) => {
    setEditingStructure(structure)
    setFormData({
      month: structure.month,
      year: structure.year,
      fee_types: structure.fee_types,
      is_active: structure.is_active
    })
    setShowForm(true)
    setShowFeeTypesGrid(structure.fee_types.length > 0)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this monthly fee structure?')) {
      return
    }

    try {
      setFormLoading(true)
      await deleteMonthlyFeeStructure(id)
      setMonthlyStructures(prev => prev.filter(s => s.id !== id))
      alert('Monthly fee structure deleted successfully!')
    } catch (error) {
      console.error('Error deleting monthly fee structure:', error)
      alert('Error deleting monthly fee structure. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      setFormLoading(true)
      const structure = monthlyStructures.find(s => s.id === id)
      if (structure) {
        await updateMonthlyFeeStructure(id, { is_active: !structure.is_active })
        setMonthlyStructures(prev => 
          prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s)
        )
      }
    } catch (error) {
      console.error('Error toggling structure status:', error)
    } finally {
      setFormLoading(false)
    }
  }

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
    <ProtectedRoute requiredRoles={['block_manager']}>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <Navbar title="Monthly Fee Structure" />
        
        {/* Navigation Links */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-4">
              <a
                href="/block-manager/dashboard"
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </a>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Monthly Fee Structure</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monthly Fee Structure</h1>
              <p className="text-sm text-gray-600 mt-1">Set different fee types and amounts for each month</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add New Structure
            </button>
          </div>

          {/* Monthly Structures List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loadingData ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading structures...</span>
              </div>
            ) : monthlyStructures.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No monthly fee structures</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new monthly fee structure.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {monthlyStructures.map((structure) => (
                  <li key={structure.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {structure.month} {structure.year}
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {structure.fee_types.map((feeType, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    feeType.is_required
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {feeType.fee_type_name}: ₹{feeType.amount}
                                  {feeType.is_required && (
                                    <span className="ml-1 text-red-600">*</span>
                                  )}
                                </span>
                              ))}
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                structure.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {structure.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <span>Total: ₹{structure.fee_types.reduce((sum, ft) => sum + ft.amount, 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(structure)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(structure.id!)}
                          className={`text-sm font-medium ${
                            structure.is_active 
                              ? 'text-red-600 hover:text-red-800' 
                              : 'text-green-600 hover:text-green-800'
                          }`}
                        >
                          {structure.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(structure.id!)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingStructure ? 'Edit Monthly Fee Structure' : 'Add New Monthly Fee Structure'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Month Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                      <select
                        value={formData.month}
                        onChange={(e) => handleInputChange('month', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Month</option>
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>

                    {/* Year */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={2020}
                        max={2030}
                        required
                      />
                    </div>

                    {/* Active Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.is_active.toString()}
                        onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Fee Types Selection Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Select Fee Types</label>
                      <p className="text-xs text-gray-500 mt-1">Optional: Add specific fee types to this structure</p>
                    </div>
                                         <button
                       type="button"
                       onClick={() => {
                         if (formData.fee_types.length > 0) {
                           // Clear selected fee types
                           setFormData(prev => ({ ...prev, fee_types: [] }))
                           setShowFeeTypesGrid(false)
                         } else {
                           // Show fee types selection
                           setShowFeeTypesGrid(true)
                         }
                       }}
                       className={`px-3 py-1 text-sm rounded-md transition-colors ${
                         formData.fee_types.length > 0
                           ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                           : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                       }`}
                     >
                       {formData.fee_types.length > 0 ? `Clear (${formData.fee_types.length} selected)` : 'Add Fee Types'}
                     </button>
                  </div>

                                     {/* Fee Types Selection */}
                   {showFeeTypesGrid && (
                     <div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {feeTypes.map(feeType => (
                           <div
                             key={feeType.id}
                             className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                               formData.fee_types.find(ft => ft.fee_type_id === feeType.id)
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
                               <div className="flex items-center">
                                 <input
                                   type="checkbox"
                                   checked={formData.fee_types.find(ft => ft.fee_type_id === feeType.id) !== undefined}
                                   onChange={(e) => {
                                     e.stopPropagation()
                                     handleFeeTypeToggle(feeType)
                                   }}
                                   onClick={(e) => e.stopPropagation()}
                                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                 />
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                  {/* Selected Fee Types Configuration */}
                  {formData.fee_types.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Configure Selected Fee Types</h4>
                      <div className="space-y-3">
                        {formData.fee_types.map((feeType, index) => (
                          <div key={feeType.fee_type_id} className="flex items-center space-x-4 p-3 bg-white rounded border">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700">{feeType.fee_type_name}</label>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div>
                                <label className="block text-xs text-gray-500">Amount (₹)</label>
                                <input
                                  type="number"
                                  value={feeType.amount}
                                  onChange={(e) => handleFeeTypeChange(feeType.fee_type_id, 'amount', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={feeType.is_required}
                                  onChange={(e) => handleFeeTypeChange(feeType.fee_type_id, 'is_required', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-xs text-gray-700">Required</label>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleFeeTypeToggle({ id: feeType.fee_type_id, name: feeType.fee_type_name, amount: feeType.amount, description: feeType.description || '', is_active: true, created_at: '', updated_at: '' })}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                                             onClick={() => {
                         setShowForm(false)
                         setEditingStructure(null)
                         setFormData({
                           month: '',
                           year: new Date().getFullYear(),
                           fee_types: [],
                           is_active: true
                         })
                         setShowFeeTypesGrid(false)
                       }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {formLoading ? 'Saving...' : (editingStructure ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
} 