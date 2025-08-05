'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogOverlay } from '@radix-ui/react-dialog'
import { confirmPayment, unconfirmPayment } from '@/lib/database'
import { useAuth } from '@/lib/contexts/AuthContext'

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  feeEntry: {
    id: string
    block: string
    member_name: string
    flat_number: string
    months: string[]
    fee: number
    total_fee: number
    payment_type: string
    remarks: string
    created_at: string
    payment_confirmed?: boolean
    payment_confirmed_by?: string
    payment_confirmed_at?: string
    created_by?: string
    user_profiles?: {
      id: string
      first_name: string
      last_name: string
      email: string
      role: string
    }
    confirmed_by_user?: {
      id: string
      first_name: string
      last_name: string
      email: string
      role: string
    }
  }
  onPaymentConfirmed?: () => void
}

export default function PaymentConfirmationModal({ 
  isOpen, 
  onClose, 
  feeEntry, 
  onPaymentConfirmed 
}: PaymentConfirmationModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<'confirm' | 'unconfirm' | null>(null)

  const handleConfirmPayment = async () => {
    if (!user?.id) return
    
    setLoading(true)
    setAction('confirm')
    
    try {
      await confirmPayment(feeEntry.id, user.id)
      onPaymentConfirmed?.()
      onClose()
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Error confirming payment. Please try again.')
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  const handleUnconfirmPayment = async () => {
    setLoading(true)
    setAction('unconfirm')
    
    try {
      await unconfirmPayment(feeEntry.id)
      onPaymentConfirmed?.()
      onClose()
    } catch (error) {
      console.error('Error unconfirming payment:', error)
      alert('Error unconfirming payment. Please try again.')
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  const canConfirm = user?.role === 'super_admin' || user?.role === 'colony_admin' || user?.role === 'block_manager'
  const isPending = !feeEntry.payment_confirmed && ['Cash', 'Request Payment'].includes(feeEntry.payment_type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <DialogContent className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100">
          <div className="p-6">
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span>Payment Confirmation</span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </DialogTitle>

            <div className="space-y-6">
              {/* Payment Details */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Payment Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Member:</span>
                    <p className="text-gray-900">{feeEntry.member_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Flat:</span>
                    <p className="text-gray-900">{feeEntry.flat_number}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Block:</span>
                    <p className="text-gray-900">{feeEntry.block}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Amount:</span>
                    <p className="text-gray-900 font-semibold">₹{feeEntry.total_fee}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Months:</span>
                    <p className="text-gray-900">{feeEntry.months.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Payment Type:</span>
                    <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      feeEntry.payment_type === 'Cash' ? 'bg-green-100 text-green-800' :
                      feeEntry.payment_type === 'UPI' ? 'bg-blue-100 text-blue-800' :
                      feeEntry.payment_type === 'Card' ? 'bg-purple-100 text-purple-800' :
                      feeEntry.payment_type === 'Bank Transfer' ? 'bg-indigo-100 text-indigo-800' :
                      feeEntry.payment_type === 'Request Payment' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {feeEntry.payment_type}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      feeEntry.payment_confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {feeEntry.payment_confirmed ? 'Confirmed' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payment Status
                </h4>
                
                {feeEntry.payment_confirmed ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-green-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Payment Confirmed</span>
                    </div>
                    {feeEntry.payment_confirmed_at && (
                      <p className="text-sm text-gray-600">
                        Confirmed on: {new Date(feeEntry.payment_confirmed_at).toLocaleString()}
                      </p>
                    )}
                    {feeEntry.confirmed_by_user && (
                      <p className="text-sm text-gray-600">
                        Confirmed by: {feeEntry.confirmed_by_user.first_name} {feeEntry.confirmed_by_user.last_name} ({feeEntry.confirmed_by_user.role})
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center text-yellow-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="font-medium">Payment Pending</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      This payment requires manual confirmation by an admin or block manager.
                    </p>
                  </div>
                )}
              </div>

              {/* Auto-confirmation notice */}
              {!['Cash', 'Request Payment'].includes(feeEntry.payment_type) && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Auto-Confirmation
                  </h4>
                  <p className="text-sm text-blue-800">
                    This payment type ({feeEntry.payment_type}) is automatically confirmed as it provides digital proof of payment.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {canConfirm && (
                <div className="space-y-3">
                  {feeEntry.payment_confirmed ? (
                    <button
                      onClick={handleUnconfirmPayment}
                      disabled={loading}
                      className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loading && action === 'unconfirm' ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Unconfirming...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Unconfirm Payment
                        </span>
                      )}
                    </button>
                  ) : isPending ? (
                    <button
                      onClick={handleConfirmPayment}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loading && action === 'confirm' ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Confirming...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Confirm Payment
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      This payment type is automatically confirmed.
                    </div>
                  )}
                </div>
              )}

              {/* Permission notice */}
              {!canConfirm && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Permission Required
                  </h4>
                  <p className="text-sm text-yellow-800">
                    Only admins and block managers can confirm payments. Please contact your administrator.
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payment Confirmation Rules
                </h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <strong>Cash & Request Payment:</strong> Require manual confirmation by admin/block manager
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <strong>UPI, Card, Bank Transfer:</strong> Automatically confirmed (digital proof available)
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <strong>Residents:</strong> Cannot confirm payments (view-only access)
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <strong>Admins/Block Managers:</strong> Can confirm/unconfirm pending payments
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
} 