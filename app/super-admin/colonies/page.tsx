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
  const [filteredColonies, setFilteredColonies] = useState<Colony[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedColony, setSelectedColony] = useState<Colony | null>(null)
  const [editingColony, setEditingColony] = useState<Colony | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [colonyStats, setColonyStats] = useState<{
    buildings: number
    flats: number
    residents: number
  } | null>(null)
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
      console.log('Fetching colonies...')
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
        console.error('Error details:', JSON.stringify(error, null, 2))
        setErrors(prev => [...prev, `Colonies error: ${error.message}`])
        return
      }

      console.log('Colonies data:', data)
      const coloniesWithAdminNames = data?.map(colony => ({
        ...colony,
        admin_name: colony.admin ? `${colony.admin.first_name} ${colony.admin.last_name}` : 'No Admin Assigned'
      })) || []

      setColonies(coloniesWithAdminNames)
      setFilteredColonies(coloniesWithAdminNames)
    } catch (error) {
      console.error('Error fetching colonies:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      setErrors(prev => [...prev, `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`])
    } finally {
      setLoading(false)
    }
  }

  // Filter colonies based on search term and status
  useEffect(() => {
    let filtered = colonies

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(colony =>
        colony.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colony.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colony.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(colony => colony.subscription_status === statusFilter)
    }

    setFilteredColonies(filtered)
  }, [colonies, searchTerm, statusFilter])

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Colony name is required'
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required'
    }
    
    if (!formData.city.trim()) {
      errors.city = 'City is required'
    }
    
    if (!formData.state.trim()) {
      errors.state = 'State is required'
    }
    
    if (!formData.pincode.trim()) {
      errors.pincode = 'Pincode is required'
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Pincode must be 6 digits'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      console.log('Saving colony:', formData)
      
      if (editingColony) {
        // Update existing colony
        const { error } = await supabase
          .from('colonies')
          .update({
            name: formData.name.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
            subscription_plan: formData.subscription_plan,
            subscription_status: formData.subscription_status
          })
          .eq('id', editingColony.id)

        if (error) {
          console.error('Error updating colony:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          setErrors(prev => [...prev, `Update error: ${error.message}`])
          return
        }
      } else {
        // Create new colony
        const { error } = await supabase
          .from('colonies')
          .insert({
            name: formData.name.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
            subscription_plan: formData.subscription_plan,
            subscription_status: formData.subscription_status
          })

        if (error) {
          console.error('Error creating colony:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          setErrors(prev => [...prev, `Create error: ${error.message}`])
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
      setFormErrors({})
      setEditingColony(null)
      setShowForm(false)
      fetchColonies()
      
      alert(editingColony ? 'Colony updated successfully!' : 'Colony created successfully!')
    } catch (error) {
      console.error('Error saving colony:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      setErrors(prev => [...prev, `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`])
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

  const fetchColonyStats = async (colonyId: string) => {
    try {
      // Get buildings count
      const { data: buildings, error: buildingsError } = await supabase
        .from('buildings')
        .select('id', { count: 'exact' })
        .eq('colony_id', colonyId)

      if (buildingsError) {
        console.error('Error fetching buildings:', buildingsError)
        return
      }

      // Get flats count
      const { data: flats, error: flatsError } = await supabase
        .from('flats')
        .select('id', { count: 'exact' })
        .eq('floor_id', 
          supabase
            .from('floors')
            .select('id')
            .eq('building_id', 
              supabase
                .from('buildings')
                .select('id')
                .eq('colony_id', colonyId)
            )
        )

      if (flatsError) {
        console.error('Error fetching flats:', flatsError)
        return
      }

      // Get residents count
      const { data: residents, error: residentsError } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('colony_id', colonyId)
        .eq('role', 'resident')

      if (residentsError) {
        console.error('Error fetching residents:', residentsError)
        return
      }

      setColonyStats({
        buildings: buildings?.length || 0,
        flats: flats?.length || 0,
        residents: residents?.length || 0
      })
    } catch (error) {
      console.error('Error fetching colony stats:', error)
    }
  }

  const handleViewDetails = async (colony: Colony) => {
    setSelectedColony(colony)
    setShowDetails(true)
    await fetchColonyStats(colony.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this colony? This action cannot be undone and will also delete all associated buildings, flats, and data.')) {
      return
    }

    try {
      console.log('Deleting colony:', id)
      
      // First check if colony has any buildings
      const { data: buildings, error: buildingsError } = await supabase
        .from('buildings')
        .select('id')
        .eq('colony_id', id)
        .limit(1)

      if (buildingsError) {
        console.error('Error checking buildings:', buildingsError)
        setErrors(prev => [...prev, `Check buildings error: ${buildingsError.message}`])
        return
      }

      if (buildings && buildings.length > 0) {
        alert('Cannot delete colony: It has associated buildings. Please delete all buildings first.')
        return
      }

      const { error } = await supabase
        .from('colonies')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting colony:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        setErrors(prev => [...prev, `Delete error: ${error.message}`])
        return
      }

      fetchColonies()
      alert('Colony deleted successfully!')
    } catch (error) {
      console.error('Error deleting colony:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      setErrors(prev => [...prev, `Unexpected delete error: ${error instanceof Error ? error.message : 'Unknown error'}`])
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

            {/* Error Display */}
            {errors.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800">Errors:</h3>
                <ul className="mt-2 text-sm text-red-700">
                  {errors.map((error, index) => (
                    <li key={index} className="list-disc list-inside">{error}</li>
                  ))}
                </ul>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => setErrors([])}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear Errors
                  </button>
                  <button
                    onClick={() => {
                      fetchColonies()
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Retry
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/disable-rls-simple', { method: 'POST' })
                        const result = await response.json()
                        console.log('RLS fix result:', result)
                        if (result.success) {
                          setErrors([])
                          fetchColonies()
                        }
                      } catch (error) {
                        console.error('Error fixing RLS:', error)
                      }
                    }}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Fix RLS Issues (Simple)
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/fix-rls-recursion', { method: 'POST' })
                        const result = await response.json()
                        console.log('Permanent RLS fix result:', result)
                        if (result.success) {
                          setErrors([])
                          fetchColonies()
                        }
                      } catch (error) {
                        console.error('Error fixing RLS permanently:', error)
                      }
                    }}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    Fix RLS Issues (Permanent)
                  </button>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Colonies</label>
                  <input
                    type="text"
                    placeholder="Search by name, city, or state..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-500">
                    Showing {filteredColonies.length} of {colonies.length} colonies
                  </div>
                </div>
              </div>
            </div>

            {/* Colonies List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredColonies.map((colony) => (
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
                          onClick={() => handleViewDetails(colony)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          View
                        </button>
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

            {filteredColonies.length === 0 && colonies.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No colonies match your search criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}

            {colonies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No colonies found. Create your first colony to get started.</p>
                <div className="mt-4 text-sm text-gray-400">
                  <p>Debug Info:</p>
                  <p>Colonies Count: {colonies.length}</p>
                  <p>Loading: {loading.toString()}</p>
                  <p>Errors: {errors.length}</p>
                </div>
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
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (formErrors.name) {
                          setFormErrors(prev => ({ ...prev, name: '' }))
                        }
                      }}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value })
                        if (formErrors.address) {
                          setFormErrors(prev => ({ ...prev, address: '' }))
                        }
                      }}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value })
                          if (formErrors.city) {
                            setFormErrors(prev => ({ ...prev, city: '' }))
                          }
                        }}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.city ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => {
                          setFormData({ ...formData, state: e.target.value })
                          if (formErrors.state) {
                            setFormErrors(prev => ({ ...prev, state: '' }))
                          }
                        }}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.state ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.state && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => {
                        setFormData({ ...formData, pincode: e.target.value })
                        if (formErrors.pincode) {
                          setFormErrors(prev => ({ ...prev, pincode: '' }))
                        }
                      }}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.pincode ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.pincode}</p>
                    )}
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

        {/* Colony Details Modal */}
        {showDetails && selectedColony && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Colony Details</h3>
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setSelectedColony(null)
                      setColonyStats(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedColony.name}</h4>
                    <p className="text-sm text-gray-500">{selectedColony.address}</p>
                    <p className="text-sm text-gray-500">{selectedColony.city}, {selectedColony.state} {selectedColony.pincode}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Statistics</h5>
                    {colonyStats ? (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{colonyStats.buildings}</div>
                          <div className="text-gray-500">Buildings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{colonyStats.flats}</div>
                          <div className="text-gray-500">Flats</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{colonyStats.residents}</div>
                          <div className="text-gray-500">Residents</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Loading statistics...</p>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Subscription</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Plan:</span>
                        <span className="capitalize">{selectedColony.subscription_plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedColony.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                          selectedColony.subscription_status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedColony.subscription_status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Admin:</span>
                        <span>{selectedColony.admin_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Created</h5>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedColony.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setSelectedColony(null)
                      setColonyStats(null)
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setSelectedColony(null)
                      setColonyStats(null)
                      handleEdit(selectedColony)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Edit Colony
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
} 