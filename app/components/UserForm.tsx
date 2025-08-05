'use client'

import React from 'react'
import SharedFeeEntryForm from './SharedFeeEntryForm'
import SharedFeeEntries from './SharedFeeEntries'

export default function UserForm() {
  return (
    <div>
      <SharedFeeEntryForm 
        mode="resident" 
      />
      
      {/* Shared Fee Entries Component */}
      <SharedFeeEntries 
        mode="resident"
      />
    </div>
  )
}
