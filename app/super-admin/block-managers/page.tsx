'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'

interface BlockManager {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  building_id: string | null
  is_active: boolean
  created_at: string
  building_name?: string
  colony_name?: string
}

interface Building {
  id: string
  name: string
  colonies?: {
    name: string
  }
}

export default function SuperAdminBlockManagersPage() {
  const [blockManagers, setBlockManagers] = useState<BlockManager[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingManager, setEditingManager] = useState<BlockManager | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    building_id: '',
    password: ''
  })

  useEffect(() => {
    fetchBlockManagers()
    fetchBuildings()
  }, [])

  const fetchBlockManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          building_id,
          is_active,
          created_at
        `)
        .eq('role', 'block_manager')
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error fetching block managers:', error)
        return
      }

      // Get buildings and colonies for mapping
      const { data: buildingsData } = await supabase
        .from('buildings')
        .select('id, name, colony_id')
      
      const { data: coloniesData } = await supabase
        .from('colonies')
        .select('id, name')

      // Create maps for efficient lookup
      const buildingMap = new Map(buildingsData?.map(building => [building.id, building.name]) || [])
      const colonyMap = new Map(coloniesData?.map(colony => [colony.id, colony.name]) || [])

      const managersWithBuildingNames = data?.map(manager => ({
        ...manager,
        building_name: manager.building_id ? buildingMap.get(manager.building_id) || 'Unknown Building' : 'No Building Assigned',
        colony_name: manager.building_id && buildingsData ? 
          (() => {
            const building = buildingsData.find(b => b.id === manager.building_id)
            return building?.colony_id ? colonyMap.get(building.colony_id) || 'Unknown Colony' : 'No Colony'
          })() 
          : 'N/A'
      })) || []

      setBlockManagers(managersWithBuildingNames)
    } catch (error) {
      console.error('Error fetching block managers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name, colony_id')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching buildings:', error)
        return
      }

      // Get colonies for mapping
      const { data: coloniesData } = await supabase
        .from('colonies')
        .select('id, name')

      const colonyMap = new Map(coloniesData?.map(colony => [colony.id, colony.name]) || [])

      // Add colony names to buildings
      const buildingsWithColonies = data?.map(building => ({
        ...building,
        colony_name: building.colony_id ? colonyMap.get(building.colony_id) || 'Unknown Colony' : 'No Colony'
      })) || []

      setBuildings(buildingsWithColonies)
    } catch (error) {
      console.error('Error fetching buildings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingManager) {
        // Update existing block manager
        const { error } = await supabase
          .from('user_profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            building_id: formData.building_id || null
          })
          .eq('id', editingManager.id)

        if (error) {
          console.error('Error updating block manager:', error)
          alert(`Error updating block manager: ${error.message}`)
          return
        }
      } else {
        // Create new block manager
        const { error } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: 'block_manager',
            building_id: formData.building_id
          }
        })

        if (error) {
          console.error('Error creating block manager:', error)
          alert(`Error creating block manager: ${error.message}`)
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
            role: 'block_manager',
            building_id: formData.building_id || null,
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
        building_id: '',
        password: ''
      })
      setEditingManager(null)
      setShowForm(false)
      fetchBlockManagers()
      
      alert(editingManager ? 'Block Manager updated successfully!' : 'Block Manager created successfully!')
    } catch (error) {
      console.error('Error saving block manager:', error)
      alert('Error saving block manager. Please try again.')
    }
  }

  const handleEdit = (manager: BlockManager) => {
    setEditingManager(manager)
    setFormData({
      first_name: manager.first_name,
      last_name: manager.last_name,
      email: manager.email,
      phone: manager.phone || '',
      building_id: manager.building_id || '',
      password: ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this block manager?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Error deactivating block manager:', error)
        alert(`Error deactivating block manager: ${error.message}`)
        return
      }

      fetchBlockManagers()
      alert('Block Manager deactivated successfully!')
    } catch (error) {
      console.error('Error deactivating block manager:', error)
      alert('Error deactivating block manager. Please try again.')
    }
  }

  const handleActivate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: true })
        .eq('id', id)

      if (error) {
        console.error('Error activating block manager:', error)
        alert(`Error activating block manager: ${error.message}`)
        return
      }

      fetchBlockManagers()
      alert('Block Manager activated successfully!')
    } catch (error) {
      console.error('Error activating block manager:', error)
      alert('Error activating block manager. Please try again.')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['super_admin']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar title="Block Managers Management" />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading block managers...</p>
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
        <Navbar title="Block Managers Management" />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <Link href="/super-admin/dashboard" className="text-gray-600 hover:text-gray-800">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Block Managers Management</h1>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add New Block Manager
              </button>
            </div>

            {/* Block Managers List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {blockManagers.map((manager) => (
                  <li key={manager.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {manager.first_name} {manager.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">{manager.email}</p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Phone: {manager.phone || 'N/A'}</span>
                              <span>Building: {manager.building_name}</span>
                              <span>Colony: {manager.colony_name}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                manager.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {manager.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(manager)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        {manager.is_active ? (
                          <button
                            onClick={() => handleDelete(manager.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(manager.id)}
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

            {blockManagers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No block managers found. Create your first block manager to get started.</p>
              </div>
            )}
          </div>
        </main>

        {/* Add/Edit Block Manager Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingManager ? 'Edit Block Manager' : 'Add New Block Manager'}
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
                    <label className="block text-sm font-medium text-gray-700">Building</label>
                    <select
                      value={formData.building_id}
                      onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a building (optional)</option>
                                             {buildings.map((building) => (
                         <option key={building.id} value={building.id}>
                           {building.name} - {building.colonies?.name || 'Unknown Colony'}
                         </option>
                       ))}
                    </select>
                  </div>
                  {!editingManager && (
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
                        setEditingManager(null)
                        setFormData({
                          first_name: '',
                          last_name: '',
                          email: '',
                          phone: '',
                          building_id: '',
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
                      {editingManager ? 'Update' : 'Create'}
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