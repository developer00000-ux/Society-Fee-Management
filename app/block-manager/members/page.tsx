'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBlocks } from '@/lib/database'
import { createResidentUser, updateResidentPassword } from '@/lib/auth'
import { Member, Block, Flat, FlatWithRelations } from '@/types/database'
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../components/ProtectedRoute'

export default function BlockManagerMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [flats, setFlats] = useState<FlatWithRelations[]>([])
  const [filteredFlats, setFilteredFlats] = useState<FlatWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    block_id: '',
    flat_id: '',
    createUserAccount: true
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Filter flats based on selected block
    if (formData.block_id) {
      const filtered = flats.filter(flat => flat.block_id === formData.block_id)
      setFilteredFlats(filtered)
    } else {
      setFilteredFlats([])
    }
  }, [formData.block_id, flats])

  const loadData = async () => {
    try {
      const [membersResponse, blocksData, flatsResponse] = await Promise.all([
        fetch('/api/members'),
        getBlocks(),
        fetch('/api/flats')
      ])
      
      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        setMembers(membersData.members)
      } else {
        const errorData = await membersResponse.json()
        console.error('Error loading members:', errorData)
        alert(`Error loading members: ${errorData.error}`)
        setMembers([])
      }
      
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
      // Update password if editing and password is provided
      if (editingMember && formData.password && editingMember.user_id) {
        try {
          await updateResidentPassword(editingMember.user_id, formData.password)
        } catch (error) {
          console.error('Error updating password:', error)
          alert(`Error updating password: ${error instanceof Error ? error.message : 'Unknown error'}`)
          return
        }
      }

      const memberData = {
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        password: formData.password,
        block_id: formData.block_id || null,
        flat_id: formData.flat_id || null,
        createUserAccount: formData.createUserAccount
      }

      if (editingMember) {
        // Update existing member
        const response = await fetch(`/api/members/${editingMember.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memberData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update member')
        }
      } else {
        // Create new member
        const response = await fetch('/api/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memberData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create member')
        }
      }

      setFormData({ name: '', phone: '', email: '', password: '', block_id: '', flat_id: '', createUserAccount: true })
      setEditingMember(null)
      setShowForm(false)
      await loadData()
    } catch (error) {
      console.error('Error saving member:', error)
      alert(`Error saving member: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      phone: member.phone || '',
      email: member.email || '',
      password: '', // Password field for editing
      block_id: '', // Will need to be set based on member's flat
      flat_id: '',
      createUserAccount: !!member.user_id // Check if user account exists
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete member')
      }

      await loadData()
    } catch (error) {
      console.error('Error deleting member:', error)
      alert(`Error deleting member: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', phone: '', email: '', password: '', block_id: '', flat_id: '', createUserAccount: true })
    setEditingMember(null)
    setShowForm(false)
  }

  const getBlockName = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    return block ? block.block_name : 'Unknown Block'
  }

  const getFlatNumber = (flatId: string) => {
    const flat = flats.find(f => f.id === flatId)
    return flat ? flat.flat_number : 'Unknown Flat'
  }

  return (
    <ProtectedRoute requiredRoles={['block_manager']}>
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Members Management</h1>
            <Link href="/block-manager/dashboard" className="text-gray-600 hover:text-gray-800">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Add Member Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-6 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Add New Member
            </button>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="Enter member name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                                     <div>
                     <label className="block text-sm font-medium mb-2">Email</label>
                     <input
                       type="email"
                       value={formData.email}
                       onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                       placeholder="Enter email address"
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2">Password</label>
                     <input
                       type="password"
                       value={formData.password}
                       onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                       placeholder="Enter password"
                       required={formData.createUserAccount}
                       disabled={!formData.createUserAccount}
                     />
                   </div>
                   <div className="col-span-full">
                     <label className="flex items-center">
                       <input
                         type="checkbox"
                         checked={formData.createUserAccount}
                         onChange={(e) => setFormData(prev => ({ ...prev, createUserAccount: e.target.checked }))}
                         className="mr-2"
                       />
                       <span className="text-sm font-medium">Create Resident User Account</span>
                     </label>
                     <p className="text-xs text-gray-500 mt-1">
                       When checked, a resident user account will be created with the provided email and password
                     </p>
                   </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Block</label>
                    <select
                      value={formData.block_id}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          block_id: e.target.value,
                          flat_id: '' // Reset flat selection when block changes
                        }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
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
                    <label className="block text-sm font-medium mb-2">Flat</label>
                    <select
                      value={formData.flat_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, flat_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                      disabled={!formData.block_id}
                    >
                      <option value="">Select a flat</option>
                      {filteredFlats.map((flat) => (
                        <option key={flat.id} value={flat.id}>
                          Flat {flat.flat_number} ({flat.flat_type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Saving...' : (editingMember ? 'Update Member' : 'Add Member')}
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

          {/* Members List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Existing Members</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Block
                    </th>
                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Flat
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       User Account
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
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {member.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {member.phone || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {member.email || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {member.block_id ? getBlockName(member.block_id) : '-'}
                        </span>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap">
                         <span className="text-sm text-gray-500">
                           {member.flat_id ? getFlatNumber(member.flat_id) : '-'}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           member.user_id ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                         }`}>
                           {member.user_id ? 'Active' : 'No Account'}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className="text-sm text-gray-500">
                           {new Date(member.created_at).toLocaleDateString()}
                         </span>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {members.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                  No members found. Add your first member to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 