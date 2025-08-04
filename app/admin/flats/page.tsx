'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFlats, createFlat, updateFlat, deleteFlat } from '@/lib/database'
import { Flat, FlatStatus } from '@/types/database'
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../components/ProtectedRoute'

export default function FlatsPage() {
  const [flats, setFlats] = useState<Flat[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null)
  const [formData, setFormData] = useState({
    flat_number: '',
    floor_id: '',
    flat_type: '',
    status: 'vacant' as FlatStatus,
    monthly_rent: '',
    security_deposit: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const flatsData = await getFlats()
      setFlats(flatsData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const flatData = {
        flat_number: formData.flat_number,
        floor_id: formData.floor_id,
        flat_type: formData.flat_type,
        status: formData.status,
        monthly_rent: parseFloat(formData.monthly_rent) || 0,
        security_deposit: parseFloat(formData.security_deposit) || 0
      }

      if (editingFlat) {
        await updateFlat(editingFlat.id, flatData)
      } else {
        await createFlat(flatData)
      }

      setFormData({ flat_number: '', floor_id: '', flat_type: '', status: 'vacant' as FlatStatus, monthly_rent: '', security_deposit: '' })
      setEditingFlat(null)
      setShowForm(false)
      await loadData()
    } catch (error) {
      console.error('Error saving flat:', error)
      alert('Error saving flat. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (flat: Flat) => {
    setEditingFlat(flat)
    setFormData({
      flat_number: flat.flat_number,
      floor_id: flat.floor_id,
      flat_type: flat.flat_type,
      status: flat.status,
      monthly_rent: flat.monthly_rent.toString(),
      security_deposit: flat.security_deposit.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flat?')) return

    try {
      await deleteFlat(id)
      await loadData()
    } catch (error) {
      console.error('Error deleting flat:', error)
      alert('Error deleting flat. Please try again.')
    }
  }

  const handleCancel = () => {
    setFormData({ flat_number: '', floor_id: '', flat_type: '', status: 'vacant' as FlatStatus, monthly_rent: '', security_deposit: '' })
    setEditingFlat(null)
    setShowForm(false)
  }

  return (
    <ProtectedRoute requiredRoles={['super_admin', 'colony_admin', 'block_manager']}>
      <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Flats Management</h1>
          <Link href="/admin" className="text-gray-600 hover:text-gray-800">
            ← Back to Admin
          </Link>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Add New Flat
          </button>
        )}

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingFlat ? 'Edit Flat' : 'Add New Flat'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Flat Number</label>
                  <input
                    type="text"
                    value={formData.flat_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, flat_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Enter flat number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Floor ID</label>
                  <input
                    type="text"
                    value={formData.floor_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, floor_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Enter floor ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Flat Type</label>
                  <input
                    type="text"
                    value={formData.flat_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, flat_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="1BHK, 2BHK, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as FlatStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Rent</label>
                  <input
                    type="number"
                    value={formData.monthly_rent}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_rent: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Monthly rent amount"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Security Deposit</label>
                  <input
                    type="number"
                    value={formData.security_deposit}
                    onChange={(e) => setFormData(prev => ({ ...prev, security_deposit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Security deposit amount"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : (editingFlat ? 'Update Flat' : 'Add Flat')}
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

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Existing Flats</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flat Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Floor ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flats.map((flat) => (
                  <tr key={flat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{flat.flat_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{flat.floor_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{flat.flat_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        flat.status === 'vacant' ? 'bg-green-100 text-green-800' :
                        flat.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                        flat.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {flat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{flat.monthly_rent}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(flat)}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(flat.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
