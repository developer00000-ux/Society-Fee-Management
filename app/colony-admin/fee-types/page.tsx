'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFeeTypes, createFeeType, updateFeeType, deleteFeeType } from '@/lib/database'
import { FeeType } from '@/types/database'
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../components/ProtectedRoute'

export default function ColonyAdminFeeTypesPage() {
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
    resetForm()
    setShowForm(false)
  }

  const handleAddNew = () => {
    resetForm()
    setShowForm(true)
  }

  return (
    <ProtectedRoute requiredRoles={['colony_admin']}>
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Fee Types Management</h1>
            <Link href="/colony-admin/dashboard" className="text-gray-600 hover:text-gray-800">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Add Fee Type Button */}
          {!showForm && (
            <button
              onClick={handleAddNew}
              className="mb-6 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add New Fee Type
            </button>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingFeeType ? 'Edit Fee Type' : 'Add New Fee Type'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="e.g., Maintenance Fee, Water Bill, Electricity"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      rows={3}
                      placeholder="Describe what this fee type is for"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Active</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Inactive fee types won't appear in fee entry forms
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                  >
                    {submitting ? 'Saving...' : (editingFeeType ? 'Update Fee Type' : 'Add Fee Type')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Fee Types List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Existing Fee Types</h2>
            </div>
            {loading ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading fee types...</p>
              </div>
            ) : (
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
                    {feeTypes.map((feeType) => (
                      <tr key={feeType.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {feeType.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {feeType.description}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            ₹{feeType.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            feeType.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
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
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
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
                    ))}
                  </tbody>
                </table>
                {feeTypes.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No fee types found. Add your first fee type to get started.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 