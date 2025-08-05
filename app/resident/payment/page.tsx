'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import Navbar from '@/app/components/Navbar'
import FeeTypeSelector from '@/app/components/FeeTypeSelector'
import { FeeType } from '@/types/database'

export default function ResidentPaymentPage() {
  const { user } = useAuth()
  const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFeeTypeChange = (feeTypeId: string, feeType: FeeType) => {
    setSelectedFeeType(feeType)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFeeType) {
      alert('Please select a fee type')
      return
    }

    setLoading(true)
    try {
      // Here you would integrate with your payment gateway
      // For now, we'll just show a success message
      alert(`Payment submitted successfully!\nFee Type: ${selectedFeeType.name}\nAmount: ₹${selectedFeeType.amount.toFixed(2)}`)
      
      // Reset form
      setSelectedFeeType(null)
      setPaymentMethod('online')
      setRemarks('')
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRoles={['resident']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Make Payment" />
        
        <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Make Payment</h1>
              <p className="text-gray-600 mt-1">Select a fee type and complete your payment</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {/* Fee Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Fee Type *
                </label>
                <FeeTypeSelector
                  value={selectedFeeType?.id}
                  onChange={handleFeeTypeChange}
                  placeholder="Choose a fee type to pay"
                  className="w-full"
                />
                {selectedFeeType && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Selected:</strong> {selectedFeeType.name}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Description:</strong> {selectedFeeType.description}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Amount:</strong> ₹{selectedFeeType.amount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="online">Online Payment</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional notes..."
                />
              </div>

              {/* Payment Summary */}
              {selectedFeeType && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee Type:</span>
                      <span className="font-medium">{selectedFeeType.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">₹{selectedFeeType.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">{paymentMethod}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-lg font-semibold">₹{selectedFeeType.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedFeeType || loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 