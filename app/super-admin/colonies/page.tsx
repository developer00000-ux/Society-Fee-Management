'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'

interface Colony {
  id: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  total_buildings: number
  total_flats: number
  admin_id: string | null
  subscription_plan: string
  subscription_status: string
  created_at: string
  admin_name?: string
}

export default function SuperAdminColoniesPage() {
  const [colonies, setColonies] = useState<Colony[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingColony, setEditingColony] = useState<Colony | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    subscription_plan: 'starter',
    subscription_status: 'active'
  })

  useEffect(() => {
    fetchColonies()
  }, [])

  const fetchColonies = async () => {
    try {
      const { data, error } = await supabase
        .from('colonies')
        .select(`
          *,
          admin:user_profiles!colonies_admin_id_fkey(
            first_name,
            last_name
          )
        `)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching colonies:', error)
        return
      }

      const coloniesWithAdminNames = data?.map(colony => ({
        ...colony,
        admin_name: colony.admin ? `${colony.admin.first_name} ${colony.admin.last_name}` : 'No Admin Assigned'
      })) || []

      setColonies(coloniesWithAdminNames)
    } catch (error) {
      console.error('Error fetching colonies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingColony) {
        // Update existing colony
        const { error } = await supabase
          .from('colonies')
          .update({
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            subscription_plan: formData.subscription_plan,
            subscription_status: formData.subscription_status
          })
          .eq('id', editingColony.id)

        if (error) {
          console.error('Error updating colony:', error)
          alert(`Error updating colony: ${error.message}`)
          return
        }
      } else {
        // Create new colony
        const { error } = await supabase
          .from('colonies')
          .insert({
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            subscription_plan: formData.subscription_plan,
            subscription_status: formData.subscription_status
          })

        if (error) {
          console.error('Error creating colony:', error)
          alert(`Error creating colony: ${error.message}`)
          return
        }
      }

      // Reset form and refresh data
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        subscription_plan: 'starter',
        subscription_status: 'active'
      })
      setEditingColony(null)
      setShowForm(false)
      fetchColonies()
      
      alert(editingColony ? 'Colony updated successfully!' : 'Colony created successfully!')
    } catch (error) {
      console.error('Error saving colony:', error)
      alert('Error saving colony. Please try again.')
    }
  }

  const handleEdit = (colony: Colony) => {
    setEditingColony(colony)
    setFormData({
      name: colony.name,
      address: colony.address,
      city: colony.city,
      state: colony.state,
      pincode: colony.pincode,
      subscription_plan: colony.subscription_plan,
      subscription_status: colony.subscription_status
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this colony? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('colonies')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting colony:', error)
        alert(`Error deleting colony: ${error.message}`)
        return
      }

      fetchColonies()
      alert('Colony deleted successfully!')
    } catch (error) {
      console.error('Error deleting colony:', error)
      alert('Error deleting colony. Please try again.')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['super_admin']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar title="Colonies Management" />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading colonies...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRoles={['super_admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Colonies Management" />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <Link href="/super-admin/dashboard" className="text-gray-600 hover:text-gray-800">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Colonies Management</h1>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add New Colony
              </button>
            </div>

            {/* Colonies List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {colonies.map((colony) => (
                  <li key={colony.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{colony.name}</h3>
                            <p className="text-sm text-gray-500">{colony.address}, {colony.city}, {colony.state} {colony.pincode}</p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Buildings: {colony.total_buildings}</span>
                              <span>Flats: {colony.total_flats}</span>
                              <span>Admin: {colony.admin_name}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                colony.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                                colony.subscription_status === 'inactive' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {colony.subscription_status}
                              </span>
                              <span className="capitalize">{colony.subscription_plan}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(colony)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(colony.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {colonies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No colonies found. Create your first colony to get started.</p>
              </div>
            )}
          </div>
        </main>

        {/* Add/Edit Colony Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingColony ? 'Edit Colony' : 'Add New Colony'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Colony Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subscription Plan</label>
                      <select
                        value={formData.subscription_plan}
                        onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="starter">Starter</option>
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.subscription_status}
                        onChange={(e) => setFormData({ ...formData, subscription_status: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingColony(null)
                        setFormData({
                          name: '',
                          address: '',
                          city: '',
                          state: '',
                          pincode: '',
                          subscription_plan: 'starter',
                          subscription_status: 'active'
                        })
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      {editingColony ? 'Update' : 'Create'}
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