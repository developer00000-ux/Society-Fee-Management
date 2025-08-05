'use client'

import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { Dialog, DialogContent, DialogTitle, DialogOverlay } from '@radix-ui/react-dialog'

interface PaymentRequestModalProps {
  isOpen: boolean
  onClose: () => void
  feeEntry: {
    memberName: string
    flatNumber: string
    block: string
    totalFee: number
    months: string[]
    remarks?: string
  }
}

interface PaymentDetails {
  upiId: string
  amount: number
  name: string
  note: string
}

export default function PaymentRequestModal({ isOpen, onClose, feeEntry }: PaymentRequestModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    upiId: '',
    amount: feeEntry.totalFee,
    name: feeEntry.memberName,
    note: `Fee payment for ${feeEntry.months.join(', ')}`
  })
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [shareSuccess, setShareSuccess] = useState<string>('')

  useEffect(() => {
    if (isOpen && paymentDetails.upiId && !generated) {
      generateQRCode()
    }
  }, [isOpen, paymentDetails, generated])

  const generateQRCode = async () => {
    if (!paymentDetails.upiId) return

    setLoading(true)
    try {
      // Create UPI payment URL
      const upiUrl = `upi://pay?pa=${encodeURIComponent(paymentDetails.upiId)}&am=${paymentDetails.amount}&tn=${encodeURIComponent(paymentDetails.note)}&cu=INR`
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeDataUrl(qrDataUrl)
      setGenerated(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Error generating QR code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof PaymentDetails, value: string | number) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }))
    setGenerated(false)
  }

  const handleRegenerateQR = () => {
    setGenerated(false)
    generateQRCode()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShareSuccess('Copied to clipboard!')
      setTimeout(() => setShareSuccess(''), 3000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      setShareSuccess('Failed to copy')
      setTimeout(() => setShareSuccess(''), 3000)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return
    
    const link = document.createElement('a')
    link.href = qrCodeDataUrl
    link.download = `payment-qr-${paymentDetails.name}-${paymentDetails.amount}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setShareSuccess('QR Code downloaded!')
    setTimeout(() => setShareSuccess(''), 3000)
  }

  const shareViaWhatsApp = () => {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(paymentDetails.upiId)}&am=${paymentDetails.amount}&tn=${encodeURIComponent(paymentDetails.note)}&cu=INR`
    const message = `Payment Request\n\nAmount: ₹${paymentDetails.amount}\nUPI ID: ${paymentDetails.upiId}\nNote: ${paymentDetails.note}\n\nUPI Link: ${upiUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    setShareSuccess('Opening WhatsApp...')
    setTimeout(() => setShareSuccess(''), 3000)
  }

  const shareViaTelegram = () => {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(paymentDetails.upiId)}&am=${paymentDetails.amount}&tn=${encodeURIComponent(paymentDetails.note)}&cu=INR`
    const message = `Payment Request\n\nAmount: ₹${paymentDetails.amount}\nUPI ID: ${paymentDetails.upiId}\nNote: ${paymentDetails.note}\n\nUPI Link: ${upiUrl}`
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`
    window.open(telegramUrl, '_blank')
    
    setShareSuccess('Opening Telegram...')
    setTimeout(() => setShareSuccess(''), 3000)
  }

  const shareViaEmail = () => {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(paymentDetails.upiId)}&am=${paymentDetails.amount}&tn=${encodeURIComponent(paymentDetails.note)}&cu=INR`
    const subject = `Payment Request - ₹${paymentDetails.amount}`
    const body = `Payment Request\n\nAmount: ₹${paymentDetails.amount}\nUPI ID: ${paymentDetails.upiId}\nNote: ${paymentDetails.note}\n\nUPI Link: ${upiUrl}`
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl)
    
    setShareSuccess('Opening email client...')
    setTimeout(() => setShareSuccess(''), 3000)
  }

  const upiUrl = paymentDetails.upiId ? 
    `upi://pay?pa=${encodeURIComponent(paymentDetails.upiId)}&am=${paymentDetails.amount}&tn=${encodeURIComponent(paymentDetails.note)}&cu=INR` : ''

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-transparent  bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <DialogContent className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100">
          <div className="p-6">
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span>Payment Request</span>
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
              {/* Fee Entry Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Fee Entry Summary
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Member:</span>
                    <p className="text-gray-900">{feeEntry.memberName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Flat:</span>
                    <p className="text-gray-900">{feeEntry.flatNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Block:</span>
                    <p className="text-gray-900">{feeEntry.block}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Amount:</span>
                    <p className="text-gray-900 font-semibold">₹{feeEntry.totalFee}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Months:</span>
                    <p className="text-gray-900">{feeEntry.months.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details Form */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Payment Details
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID *
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.upiId}
                    onChange={(e) => handleInputChange('upiId', e.target.value)}
                    placeholder="example@upi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={paymentDetails.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payer Name
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Note
                  </label>
                  <textarea
                    value={paymentDetails.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Payment note..."
                  />
                </div>
              </div>

              {/* Generate QR Button */}
              {paymentDetails.upiId && (
                <button
                  onClick={handleRegenerateQR}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                      </svg>
                      Generate QR Code
                    </span>
                  )}
                </button>
              )}

              {/* QR Code Display */}
              {qrCodeDataUrl && (
                <div className="text-center space-y-4">
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-lg">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Payment QR Code" 
                      className="mx-auto"
                      style={{ maxWidth: '250px' }}
                    />
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-green-800 space-y-1">
                      <p className="font-medium">Scan this QR code to make the payment</p>
                      <p className="text-xs">Amount: ₹{paymentDetails.amount}</p>
                      <p className="text-xs">UPI ID: {paymentDetails.upiId}</p>
                    </div>
                  </div>

                  {/* Share Options */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share QR Code
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={downloadQRCode}
                        className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </button>
                      
                      <button
                        onClick={() => copyToClipboard(qrCodeDataUrl)}
                        className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Image
                      </button>
                    </div>

                    <div className="mt-3 space-y-2">
                      <button
                        onClick={shareViaWhatsApp}
                        className="w-full flex items-center justify-center px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        Share via WhatsApp
                      </button>
                      
                      <button
                        onClick={shareViaTelegram}
                        className="w-full flex items-center justify-center px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        Share via Telegram
                      </button>
                      
                      <button
                        onClick={shareViaEmail}
                        className="w-full flex items-center justify-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Share via Email
                      </button>
                    </div>
                  </div>

                  {/* Copy UPI URL */}
                  {upiUrl && (
                    <div className="space-y-3">
                      <button
                        onClick={() => copyToClipboard(upiUrl)}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy UPI Link
                      </button>
                      <div className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded">
                        {upiUrl}
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {shareSuccess && (
                    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                      {shareSuccess}
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Instructions
                </h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Enter the UPI ID where you want to receive payments
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Generate the QR code
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Share the QR code with the resident using any of the options above
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Resident can scan the QR code to make payment
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Payment will be received directly to your UPI ID
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