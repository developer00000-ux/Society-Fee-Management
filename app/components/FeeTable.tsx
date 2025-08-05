import React, { useState, useMemo } from 'react'

interface FeeEntry {
  id: string
  block: string
  memberName: string
  flatNumber: string
  months: string[]
  fee: string
  totalFee: string
  paymentType: string
  remarks: string
  date: string
}

interface FeeTableProps {
  entries: FeeEntry[]
  showDeleteButton?: boolean
  onDelete?: (id: string) => void
}

export default function FeeTable({ entries, showDeleteButton = false, onDelete }: FeeTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedBlock, setSelectedBlock] = useState('')
  const [selectedFlat, setSelectedFlat] = useState('')

  // Get unique blocks and flats for filter options
  const uniqueBlocks = useMemo(() => {
    const blocks = [...new Set(entries.map(entry => entry.block))]
    return blocks.sort()
  }, [entries])

  const uniqueFlats = useMemo(() => {
    const flats = [...new Set(entries.map(entry => entry.flatNumber))]
    return flats.sort()
  }, [entries])

  // Filter entries based on search and filters
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = searchTerm === '' || 
        entry.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.remarks.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDate = selectedDate === '' || entry.date === selectedDate
      const matchesBlock = selectedBlock === '' || entry.block === selectedBlock
      const matchesFlat = selectedFlat === '' || entry.flatNumber === selectedFlat

      return matchesSearch && matchesDate && matchesBlock && matchesFlat
    })
  }, [entries, searchTerm, selectedDate, selectedBlock, selectedFlat])

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedDate('')
    setSelectedBlock('')
    setSelectedFlat('')
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No fee entries yet. Submit your first entry above.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Fee Entries</h2>
        
        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, flat, or remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Block Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Block
            </label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Blocks</option>
              {uniqueBlocks.map(block => (
                <option key={block} value={block}>
                  Block {block}
                </option>
              ))}
            </select>
          </div>

          {/* Flat Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flat
            </label>
            <select
              value={selectedFlat}
              onChange={(e) => setSelectedFlat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Flats</option>
              {uniqueFlats.map(flat => (
                <option key={flat} value={flat}>
                  {flat}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 mb-2">
          Showing {filteredEntries.length} of {entries.length} entries
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Block
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Flat No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Months
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee/Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remarks
              </th>
              {showDeleteButton && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Block {entry.block}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.memberName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.flatNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    {entry.months.join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{entry.fee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  ₹{entry.totalFee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {entry.paymentType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {entry.remarks || '-'}
                </td>
                {showDeleteButton && onDelete && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 