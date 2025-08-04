'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'

interface Colony {
  id: string
  name: string
  address: string
  city: string
  state: string
  total_buildings: number
  total_flats: number
  subscription_status: string
  created_at: string
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
  colony_id: string
  created_at: string
}

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('colonies')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // Real data from database
  const [colonies, setColonies] = useState<Colony[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [admins, setAdmins] = useState<User[]>([])
  const [blockManagers, setBlockManagers] = useState<User[]>([])

  // Fetch data from database
  const fetchColonies = async () => {
    try {
      const { data, error } = await supabase
        .from('colonies')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching colonies:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching colonies:', error)
      return []
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error fetching users:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'colony_admin')
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error fetching admins:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching admins:', error)
      return []
    }
  }

  const fetchBlockManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'block_manager')
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error fetching block managers:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching block managers:', error)
      return []
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [coloniesData, usersData, adminsData, blockManagersData] = await Promise.all([
          fetchColonies(),
          fetchUsers(),
          fetchAdmins(),
          fetchBlockManagers()
        ])

        setColonies(coloniesData)
        setUsers(usersData)
        setAdmins(adminsData)
        setBlockManagers(blockManagersData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const DashboardContent = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Navbar */}
        <Navbar title="Super Admin Dashboard" />

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('colonies')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'colonies'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Colonies ({colonies.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admins'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Colony Admins ({admins.length})
              </button>
              <button
                onClick={() => setActiveTab('managers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'managers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Block Managers ({blockManagers.length})
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="max-w-lg">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {activeTab === 'colonies' && (
                  <ul className="divide-y divide-gray-200">
                    {colonies
                      .filter(colony => 
                        colony.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        colony.city.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((colony) => (
                        <li key={colony.id} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{colony.name}</div>
                                <div className="text-sm text-gray-500">{colony.address}, {colony.city}, {colony.state}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">{colony.total_buildings}</span> buildings,{' '}
                                <span className="font-medium">{colony.total_flats}</span> flats
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                colony.subscription_status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {colony.subscription_status}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}

                {activeTab === 'users' && (
                  <ul className="divide-y divide-gray-200">
                    {users
                      .filter(user => 
                        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
                        <li key={user.id} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}

                {activeTab === 'admins' && (
                  <ul className="divide-y divide-gray-200">
                    {admins
                      .filter(admin => 
                        admin.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        admin.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((admin) => (
                        <li key={admin.id} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {admin.first_name.charAt(0)}{admin.last_name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {admin.first_name} {admin.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{admin.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                admin.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {admin.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-sm text-gray-500">Colony Admin</span>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}

                {activeTab === 'managers' && (
                  <ul className="divide-y divide-gray-200">
                    {blockManagers
                      .filter(manager => 
                        manager.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        manager.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        manager.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((manager) => (
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
                                <div className="text-sm text-gray-500">{manager.email}</div>
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
                              <span className="text-sm text-gray-500">Block Manager</span>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRoles={['super_admin']}>
      <DashboardContent />
    </ProtectedRoute>
  )
} 