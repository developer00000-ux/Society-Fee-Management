'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Block } from '@/types/database'
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../components/ProtectedRoute'

export default function BlockManagerBlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const [formData, setFormData] = useState({
    block_name: '',
    description: '',
    colony_id: ''
  })
  const [colonies, setColonies] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    loadBlocks()
    loadColonies()
  }, [])

  const loadColonies = async () => {
    try {
      const response = await fetch('/api/colonies')
      if (response.ok) {
        const data = await response.json()
        setColonies(data.colonies || [])
      } else {
        console.error('Error loading colonies')
      }
    } catch (error) {
      console.error('Error loading colonies:', error)
    }
  }

  const loadBlocks = async () => {
    try {
      const response = await fetch('/api/blocks')
      if (response.ok) {
        const data = await response.json()
        setBlocks(data.blocks)
      } else {
        const errorData = await response.json()
        console.error('Error loading blocks:', errorData)
        alert(`Error loading blocks: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error loading blocks:', error)
      alert('Failed to load blocks. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingBlock) {
        // Update existing block
        const response = await fetch(`/api/blocks/${editingBlock.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update block')
        }
      } else {
        // Create new block
        const response = await fetch('/api/blocks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create block')
        }
      }

      setFormData({ block_name: '', description: '', colony_id: '' })
      setEditingBlock(null)
      setShowForm(false)
      await loadBlocks()
    } catch (error) {
      console.error('Error saving block:', error)
      alert(`Error saving block: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (block: Block) => {
    setEditingBlock(block)
    setFormData({
      block_name: block.block_name,
      description: block.description || '',
      colony_id: block.colony_id || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this block?')) return

    try {
      const response = await fetch(`/api/blocks/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete block')
      }

      await loadBlocks()
    } catch (error) {
      console.error('Error deleting block:', error)
      alert(`Error deleting block: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCancel = () => {
    setFormData({ block_name: '', description: '', colony_id: '' })
    setEditingBlock(null)
    setShowForm(false)
  }

  return (
    <ProtectedRoute requiredRoles={['block_manager']}>
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Blocks Management</h1>
            <Link href="/block-manager/dashboard" className="text-gray-600 hover:text-gray-800">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Add Block Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Block
            </button>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingBlock ? 'Edit Block' : 'Add New Block'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Block Name</label>
                    <input
                      type="text"
                      value={formData.block_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, block_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter block name (e.g., A, B, C)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Colony</label>
                    <select
                      value={formData.colony_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, colony_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    >
                      <option value="">Select a colony</option>
                      {colonies.map((colony) => (
                        <option key={colony.id} value={colony.id}>
                          {colony.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Saving...' : (editingBlock ? 'Update Block' : 'Add Block')}
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

          {/* Blocks List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Existing Blocks</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Block Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Colony
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
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
                  {blocks.map((block) => (
                    <tr key={block.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          Block {block.block_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {block.colony_name || 'No Colony Assigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {block.description || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(block.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(block)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(block.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {blocks.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                  No blocks found. Add your first block to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 