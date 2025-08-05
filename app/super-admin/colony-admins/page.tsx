'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'

interface ColonyAdmin {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  colony_id: string | null
  is_active: boolean
  created_at: string
  colony_name?: string
}

interface Colony {
  id: string
  name: string
}

export default function SuperAdminColonyAdminsPage() {
  const [colonyAdmins, setColonyAdmins] = useState<ColonyAdmin[]>([])
  const [colonies, setColonies] = useState<Colony[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<ColonyAdmin | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    colony_id: '',
    password: ''
  })

  useEffect(() => {
    fetchColonyAdmins()
    fetchColonies()
  }, [])

  const fetchColonyAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          colony_id,
          is_active,
          created_at,
          colonies(
            name
          )
        `)
        .eq('role', 'colony_admin')
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error fetching colony admins:', error)
        return
      }

      const adminsWithColonyNames = data?.map(admin => ({
        ...admin,
        colony_name: admin.colonies && typeof admin.colonies === 'object' && 'name' in admin.colonies 
          ? (admin.colonies as any).name 
          : 'No Colony Assigned'
      })) || []

      setColonyAdmins(adminsWithColonyNames)
    } catch (error) {
      console.error('Error fetching colony admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchColonies = async () => {
    try {
      const { data, error } = await supabase
        .from('colonies')
        .select('id, name')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching colonies:', error)
        return
      }

      setColonies(data || [])
    } catch (error) {
      console.error('Error fetching colonies:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingAdmin) {
        // Update existing colony admin
        const { error } = await supabase
          .from('user_profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            colony_id: formData.colony_id || null
          })
          .eq('id', editingAdmin.id)

        if (error) {
          console.error('Error updating colony admin:', error)
          alert(`Error updating colony admin: ${error.message}`)
          return
        }
      } else {
        // Create new colony admin
        const { error } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: 'colony_admin',
            colony_id: formData.colony_id
          }
        })

        if (error) {
          console.error('Error creating colony admin:', error)
          alert(`Error creating colony admin: ${error.message}`)
          return
        }

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            role: 'colony_admin',
            colony_id: formData.colony_id || null,
            is_active: true
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          alert(`Error creating user profile: ${profileError.message}`)
          return
        }
      }

      // Reset form and refresh data
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        colony_id: '',
        password: ''
      })
      setEditingAdmin(null)
      setShowForm(false)
      fetchColonyAdmins()
      
      alert(editingAdmin ? 'Colony Admin updated successfully!' : 'Colony Admin created successfully!')
    } catch (error) {
      console.error('Error saving colony admin:', error)
      alert('Error saving colony admin. Please try again.')
    }
  }

  const handleEdit = (admin: ColonyAdmin) => {
    setEditingAdmin(admin)
    setFormData({
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      phone: admin.phone || '',
      colony_id: admin.colony_id || '',
      password: ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this colony admin?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Error deactivating colony admin:', error)
        alert(`Error deactivating colony admin: ${error.message}`)
        return
      }

      fetchColonyAdmins()
      alert('Colony Admin deactivated successfully!')
    } catch (error) {
      console.error('Error deactivating colony admin:', error)
      alert('Error deactivating colony admin. Please try again.')
    }
  }

  const handleActivate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: true })
        .eq('id', id)

      if (error) {
        console.error('Error activating colony admin:', error)
        alert(`Error activating colony admin: ${error.message}`)
        return
      }

      fetchColonyAdmins()
      alert('Colony Admin activated successfully!')
    } catch (error) {
      console.error('Error activating colony admin:', error)
      alert('Error activating colony admin. Please try again.')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['super_admin']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar title="Colony Admins Management" />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading colony admins...</p>
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
        <Navbar title="Colony Admins Management" />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <Link href="/super-admin/dashboard" className="text-gray-600 hover:text-gray-800">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Colony Admins Management</h1>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add New Colony Admin
              </button>
            </div>

            {/* Colony Admins List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {colonyAdmins.map((admin) => (
                  <li key={admin.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {admin.first_name} {admin.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">{admin.email}</p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Phone: {admin.phone || 'N/A'}</span>
                              <span>Colony: {admin.colony_name}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                admin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {admin.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        {admin.is_active ? (
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(admin.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {colonyAdmins.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No colony admins found. Create your first colony admin to get started.</p>
              </div>
            )}
          </div>
        </main>

        {/* Add/Edit Colony Admin Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAdmin ? 'Edit Colony Admin' : 'Add New Colony Admin'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Colony</label>
                    <select
                      value={formData.colony_id}
                      onChange={(e) => setFormData({ ...formData, colony_id: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a colony (optional)</option>
                      {colonies.map((colony) => (
                        <option key={colony.id} value={colony.id}>
                          {colony.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!editingAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingAdmin(null)
                        setFormData({
                          first_name: '',
                          last_name: '',
                          email: '',
                          phone: '',
                          colony_id: '',
                          password: ''
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
                      {editingAdmin ? 'Update' : 'Create'}
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