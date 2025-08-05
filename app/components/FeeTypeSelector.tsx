'use client'

import React, { useState, useEffect } from 'react'
import { getActiveFeeTypes } from '@/lib/database'
import { FeeType } from '@/types/database'

interface FeeTypeSelectorProps {
  value?: string
  onChange: (feeTypeId: string, feeType: FeeType) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function FeeTypeSelector({
  value,
  onChange,
  placeholder = "Select a fee type",
  className = "",
  disabled = false
}: FeeTypeSelectorProps) {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFeeTypes()
  }, [])

  const loadFeeTypes = async () => {
    try {
      setLoading(true)
      const data = await getActiveFeeTypes()
      setFeeTypes(data)
    } catch (error) {
      console.error('Error loading fee types:', error)
      setError('Failed to load fee types')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    const selectedFeeType = feeTypes.find(ft => ft.id === selectedId)
    
    if (selectedFeeType) {
      onChange(selectedId, selectedFeeType)
    }
  }

  if (loading) {
    return (
      <div className={`px-3 py-2 border border-gray-300 rounded-md bg-gray-50 ${className}`}>
        <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600 ${className}`}>
        {error}
      </div>
    )
  }

  return (
    <select
      value={value || ''}
      onChange={handleChange}
      disabled={disabled || feeTypes.length === 0}
      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    >
      <option value="">{placeholder}</option>
      {feeTypes.map((feeType) => (
        <option key={feeType.id} value={feeType.id}>
          {feeType.name} - ₹{feeType.amount.toFixed(2)}
        </option>
      ))}
    </select>
  )
} 