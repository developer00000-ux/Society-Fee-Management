'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role: string
  colony_id: string | null
  building_id: string | null
  flat_id: string | null
  is_active: boolean
  created_at: string
  colony_name?: string
  building_name?: string
}

interface Colony {
  id: string
  name: string
}

interface Building {
  id: string
  name: string
  colonies?: {
    name: string
  }
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [colonies, setColonies] = useState<Colony[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'resident',
    colony_id: '',
    building_id: '',
    password: ''
  })

  useEffect(() => {
    fetchUsers()
    fetchColonies()
    fetchBuildings()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          role,
          colony_id,
          building_id,
          flat_id,
          is_active,
          created_at
        `)
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error fetching users:', error)
        return
      }

      // Get colonies and buildings for mapping
      const { data: coloniesData } = await supabase
        .from('colonies')
        .select('id, name')
      
      const { data: buildingsData } = await supabase
        .from('buildings')
        .select('id, name')

      // Create maps for efficient lookup
      const colonyMap = new Map(coloniesData?.map(colony => [colony.id, colony.name]) || [])
      const buildingMap = new Map(buildingsData?.map(building => [building.id, building.name]) || [])

      const usersWithNames = data?.map(user => ({
        ...user,
        colony_name: user.colony_id ? colonyMap.get(user.colony_id) || 'Unknown Colony' : 'No Colony Assigned',
        building_name: user.building_id ? buildingMap.get(user.building_id) || 'Unknown Building' : 'No Building Assigned'
      })) || []

      setUsers(usersWithNames)
    } catch (error) {
      console.error('Error fetching users:', error)
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

  const fetchBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select(`
          id,
          name,
          colonies!buildings_colony_id_fkey(
            name
          )
        `)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching buildings:', error)
        return
      }

      setBuildings((data as any) || [])
    } catch (error) {
      console.error('Error fetching buildings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('user_profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            colony_id: formData.colony_id || null,
            building_id: formData.building_id || null
          })
          .eq('id', editingUser.id)

        if (error) {
          console.error('Error updating user:', error)
          alert(`Error updating user: ${error.message}`)
          return
        }
      } else {
        // Create new user
        const { error } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            colony_id: formData.colony_id,
            building_id: formData.building_id
          }
        })

        if (error) {
          console.error('Error creating user:', error)
          alert(`Error creating user: ${error.message}`)
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
            role: formData.role,
            colony_id: formData.colony_id || null,
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
        role: 'resident',
        colony_id: '',
        building_id: '',
        password: ''
      })
      setEditingUser(null)
      setShowForm(false)
      fetchUsers()
      
      alert(editingUser ? 'User updated successfully!' : 'User created successfully!')
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Error saving user. Please try again.')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      colony_id: user.colony_id || '',
      building_id: user.building_id || '',
      password: ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Error deactivating user:', error)
        alert(`Error deactivating user: ${error.message}`)
        return
      }

      fetchUsers()
      alert('User deactivated successfully!')
    } catch (error) {
      console.error('Error deactivating user:', error)
      alert('Error deactivating user. Please try again.')
    }
  }

  const handleActivate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: true })
        .eq('id', id)

      if (error) {
        console.error('Error activating user:', error)
        alert(`Error activating user: ${error.message}`)
        return
      }

      fetchUsers()
      alert('User activated successfully!')
    } catch (error) {
      console.error('Error activating user:', error)
      alert('Error activating user. Please try again.')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800'
      case 'colony_admin':
        return 'bg-blue-100 text-blue-800'
      case 'block_manager':
        return 'bg-green-100 text-green-800'
      case 'resident':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['super_admin']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar title="Users Management" />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading users...</p>
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
        <Navbar title="Users Management" />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <Link href="/super-admin/dashboard" className="text-gray-600 hover:text-gray-800">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Users Management</h1>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add New User
              </button>
            </div>

            {/* Users List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Phone: {user.phone || 'N/A'}</span>
                              <span>Colony: {user.colony_name}</span>
                              <span>Building: {user.building_name}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                                {user.role.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        {user.is_active ? (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user.id)}
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

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found. Create your first user to get started.</p>
              </div>
            )}
          </div>
        </main>

        {/* Add/Edit User Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingUser ? 'Edit User' : 'Add New User'}
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
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="resident">Resident</option>
                      <option value="block_manager">Block Manager</option>
                      <option value="colony_admin">Colony Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
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
                  {!editingUser && (
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
                        setEditingUser(null)
                        setFormData({
                          first_name: '',
                          last_name: '',
                          email: '',
                          phone: '',
                          role: 'resident',
                          colony_id: '',
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
                      {editingUser ? 'Update' : 'Create'}
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