'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'

interface BlockManager {
  id: string
  first_name: string
  last_name: string
  phone: string
  is_active: boolean
  colony_id: string
  colony_name: string
  created_at: string
}

interface Colony {
  id: string
  name: string
}

export default function BlockManagersPage() {
  const [blockManagers, setBlockManagers] = useState<BlockManager[]>([])
  const [colonies, setColonies] = useState<Colony[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingManager, setEditingManager] = useState<BlockManager | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    colony_id: '',
    password: ''
  })

  useEffect(() => {
    fetchBlockManagers()
    fetchColonies()
  }, [])

  const fetchBlockManagers = async () => {
    try {
      const response = await fetch('/api/block-managers')
      if (response.ok) {
        const data = await response.json()
        setBlockManagers(data.blockManagers || [])
      } else {
        const errorData = await response.json()
        console.error('Error fetching block managers:', errorData)
        alert(`Error fetching block managers: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error fetching block managers:', error)
      alert('Failed to load block managers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchColonies = async () => {
    try {
      const response = await fetch('/api/colonies')
      if (response.ok) {
        const data = await response.json()
        setColonies(data.colonies || [])
      } else {
        const errorData = await response.json()
        console.error('Error fetching colonies:', errorData)
        alert(`Error fetching colonies: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error fetching colonies:', error)
      alert('Failed to load colonies. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingManager) {
        const response = await fetch(`/api/block-managers/${editingManager.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update block manager')
        }
      } else {
        const response = await fetch('/api/block-managers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create block manager')
        }
      }
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        colony_id: '',
        password: ''
      })
      setEditingManager(null)
      setShowForm(false)
      fetchBlockManagers()
    } catch (error) {
      console.error('Error handling form submission:', error)
      alert(`Error saving block manager: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEdit = (manager: BlockManager) => {
    setEditingManager(manager)
    setFormData({
      first_name: manager.first_name,
      last_name: manager.last_name,
      email: '',
      phone: manager.phone || '',
      colony_id: manager.colony_id || '',
      password: ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this block manager?')) return
    try {
      const response = await fetch(`/api/block-managers/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete block manager')
      }
      fetchBlockManagers()
    } catch (error) {
      console.error('Error deleting block manager:', error)
      alert(`Error deleting block manager: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <ProtectedRoute requiredRoles={['colony_admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Block Managers Management" />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Block Managers</h1>
                <Link href="/colony-admin/dashboard" className="text-gray-600 hover:text-gray-800">
                  ← Back to Dashboard
                </Link>
              </div>
              <button
                onClick={() => {
                  setShowForm(true)
                  setEditingManager(null)
                  setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    colony_id: '',
                    password: ''
                  })
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Block Manager
              </button>
            </div>
            {/* Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {editingManager ? 'Edit Block Manager' : 'Add Block Manager'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                          required
                          value={formData.colony_id}
                          onChange={(e) => setFormData({ ...formData, colony_id: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a colony</option>
                          {colonies.map((colony) => (
                            <option key={colony.id} value={colony.id}>
                              {colony.name}
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
                          onClick={() => setShowForm(false)}
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
            {/* Block Managers List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {blockManagers.map((manager) => (
                    <li key={manager.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">
                                {manager.first_name.charAt(0)}{manager.last_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {manager.first_name} {manager.last_name}
                            </div>
                            {manager.phone && (
                              <div className="text-sm text-gray-500">{manager.phone}</div>
                            )}
                            <div className="text-sm text-gray-500">
                              Colony: {manager.colony_name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            manager.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {manager.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleEdit(manager)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(manager.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 