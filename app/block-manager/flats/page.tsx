'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBlocks } from '@/lib/database'
import { Flat, FlatStatus, Block, FlatWithRelations } from '@/types/database'
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../components/ProtectedRoute'

export default function BlockManagerFlatsPage() {
  const [flats, setFlats] = useState<FlatWithRelations[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingFlat, setEditingFlat] = useState<FlatWithRelations | null>(null)
  const [formData, setFormData] = useState({
    flat_number: '',
    block_id: '',
    floor_number: '1',
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
      const [flatsResponse, blocksData] = await Promise.all([
        fetch('/api/flats'),
        getBlocks()
      ])
      
      if (flatsResponse.ok) {
        const flatsData = await flatsResponse.json()
        setFlats(flatsData.flats)
      } else {
        const errorData = await flatsResponse.json()
        console.error('Error loading flats:', errorData)
        alert(`Error loading flats: ${errorData.error}`)
        setFlats([])
      }
      
      setBlocks(blocksData)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load data. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingFlat) {
        // Update existing flat
        const response = await fetch(`/api/flats/${editingFlat.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flat_number: formData.flat_number,
            floor_id: formData.block_id, // Using block_id as floor_id for now
            flat_type: formData.flat_type,
            status: formData.status,
            monthly_rent: parseFloat(formData.monthly_rent) || 0,
            security_deposit: parseFloat(formData.security_deposit) || 0
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update flat')
        }
      } else {
        // Create new flat
        const response = await fetch('/api/flats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
                     body: JSON.stringify({
             flat_number: formData.flat_number,
             block_id: formData.block_id,
             floor_number: parseInt(formData.floor_number) || 1,
             flat_type: formData.flat_type,
             status: formData.status,
             monthly_rent: parseFloat(formData.monthly_rent) || 0,
             security_deposit: parseFloat(formData.security_deposit) || 0
           })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create flat')
        }
      }

      setFormData({ 
        flat_number: '', 
        block_id: '', 
        floor_number: '1',
        flat_type: '', 
        status: 'vacant' as FlatStatus, 
        monthly_rent: '', 
        security_deposit: '' 
      })
      setEditingFlat(null)
      setShowForm(false)
      await loadData()
    } catch (error) {
      console.error('Error saving flat:', error)
      alert(`Error saving flat: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (flat: any) => {
    setEditingFlat(flat)
    setFormData({
      flat_number: flat.flat_number,
      block_id: flat.block_id || flat.floor_id, // Use block_id if available, otherwise floor_id
      floor_number: '1', // Default floor number for editing
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
      const response = await fetch(`/api/flats/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete flat')
      }

      await loadData()
    } catch (error) {
      console.error('Error deleting flat:', error)
      alert(`Error deleting flat: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCancel = () => {
    setFormData({ 
      flat_number: '', 
      block_id: '', 
      floor_number: '1',
      flat_type: '', 
      status: 'vacant' as FlatStatus, 
      monthly_rent: '', 
      security_deposit: '' 
    })
    setEditingFlat(null)
    setShowForm(false)
  }

  const getBlockName = (flat: any) => {
    return flat.block_name || 'Unknown Block'
  }

  return (
    <ProtectedRoute requiredRoles={['block_manager']}>
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Flats Management</h1>
            <Link href="/block-manager/dashboard" className="text-gray-600 hover:text-gray-800">
              ← Back to Dashboard
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
                     <label className="block text-sm font-medium mb-2">Block</label>
                     <select
                       value={formData.block_id}
                       onChange={(e) => setFormData(prev => ({ ...prev, block_id: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                       required
                     >
                       <option value="">Select a block</option>
                       {blocks.map((block) => (
                         <option key={block.id} value={block.id}>
                           Block {block.block_name}
                         </option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2">Floor Number</label>
                     <input
                       type="number"
                       value={formData.floor_number}
                       onChange={(e) => setFormData(prev => ({ ...prev, floor_number: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                       placeholder="Enter floor number"
                       min="1"
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
                       Block
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Floor
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
                         <div className="text-sm text-gray-900">{getBlockName(flat)}</div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900">{flat.floors?.floor_number || 'N/A'}</div>
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
              {flats.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                  No flats found. Add your first flat to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 