'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFlats, createFlat, updateFlat, deleteFlat, getBlocks, getMembers } from '@/lib/database'
import { Flat, Block, Member } from '@/types/database'
import Navbar from '../../components/Navbar'

interface FlatWithRelations extends Flat {
  blocks: { block_name: string }
  members: { name: string } | null
}

export default function FlatsPage() {
  const [flats, setFlats] = useState<FlatWithRelations[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null)
  const [formData, setFormData] = useState({
    flat_number: '',
    block_id: '',
    member_id: '',
    floor_number: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [flatsData, blocksData, membersData] = await Promise.all([
        getFlats(),
        getBlocks(),
        getMembers()
      ])
      setFlats(flatsData)
      setBlocks(blocksData)
      setMembers(membersData)
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
        block_id: formData.block_id,
        member_id: formData.member_id || null,
        floor_number: formData.floor_number ? parseInt(formData.floor_number) : null
      }

      if (editingFlat) {
        await updateFlat(editingFlat.id, flatData)
      } else {
        await createFlat(flatData)
      }

      setFormData({ flat_number: '', block_id: '', member_id: '', floor_number: '' })
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
      block_id: flat.block_id,
      member_id: flat.member_id || '',
      floor_number: flat.floor_number?.toString() || ''
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
    setFormData({ flat_number: '', block_id: '', member_id: '', floor_number: '' })
    setEditingFlat(null)
    setShowForm(false)
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Flats Management</h1>
          <Link href="/admin" className="text-gray-600 hover:text-gray-800">
            ← Back to Admin
          </Link>
        </div>

      {/* Add Flat Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          Add New Flat
        </button>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingFlat ? 'Edit Flat' : 'Add New Flat'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <option value="">Select Block</option>
                  {blocks.map(block => (
                    <option key={block.id} value={block.id}>
                      Block {block.block_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Member</label>
                <select
                  value={formData.member_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, member_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="">Select Member (Optional)</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
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
                  placeholder="Floor number"
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

      {/* Flats List */}
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
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor
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
              {flats.map((flat) => (
                <tr key={flat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {flat.flat_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      Block {flat.blocks.block_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {flat.members?.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {flat.floor_number || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {new Date(flat.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(flat)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
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
  )
} 