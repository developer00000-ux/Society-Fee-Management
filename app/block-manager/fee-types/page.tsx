'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFeeTypes, createFeeType, updateFeeType, deleteFeeType } from '@/lib/database'
import { FeeType } from '@/types/database'
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../components/ProtectedRoute'

export default function FeeTypesPage() {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    is_active: true
  })

  useEffect(() => {
    loadFeeTypes()
  }, [])

  const loadFeeTypes = async () => {
    setLoading(true)
    try {
      const data = await getFeeTypes()
      setFeeTypes(data)
    } catch (error) {
      console.error('Error loading fee types:', error)
      alert('Error loading fee types. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.amount) {
      alert('Please fill in all required fields.')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0.')
      return
    }

    setSubmitting(true)
    try {
      const feeTypeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        amount: amount,
        is_active: formData.is_active
      }

      if (editingFeeType) {
        await updateFeeType(editingFeeType.id, feeTypeData)
        alert('Fee type updated successfully!')
      } else {
        await createFeeType(feeTypeData)
        alert('Fee type created successfully!')
      }

      await loadFeeTypes()
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('Error saving fee type:', error)
      alert(`Error saving fee type: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (feeType: FeeType) => {
    setEditingFeeType(feeType)
    setFormData({
      name: feeType.name,
      description: feeType.description,
      amount: feeType.amount.toString(),
      is_active: feeType.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee type?')) return

    try {
      await deleteFeeType(id)
      alert('Fee type deleted successfully!')
      await loadFeeTypes()
    } catch (error) {
      console.error('Error deleting fee type:', error)
      alert(`Error deleting fee type: ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: '',
      is_active: true
    })
    setEditingFeeType(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    resetForm()
  }

  const handleAddNew = () => {
    resetForm()
    setShowForm(true)
  }

  return (
    <ProtectedRoute requiredRoles={['block_manager']}>
      <div>
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Fee Types Management</h1>
            <Link href="/block-manager/dashboard" className="text-gray-600 hover:text-gray-800">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Add New Fee Type Button */}
          <div className="mb-6">
            <button
              onClick={handleAddNew}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add New Fee Type
            </button>
          </div>

          {/* Fee Type Form */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingFeeType ? 'Edit Fee Type' : 'Add New Fee Type'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee Type Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Rent, Maintenance Fee, Electricity"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe what this fee type is for..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active (available for selection)
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Saving...' : (editingFeeType ? 'Update Fee Type' : 'Create Fee Type')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Fee Types Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Fee Types</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : feeTypes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No fee types</h3>
                          <p className="mt-1 text-sm text-gray-500">Get started by creating a new fee type.</p>
                          <div className="mt-6">
                            <button
                              onClick={handleAddNew}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Add Fee Type
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    feeTypes.map((feeType) => (
                      <tr key={feeType.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {feeType.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {feeType.description}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            ₹{feeType.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            feeType.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {feeType.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {new Date(feeType.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(feeType)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(feeType.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 