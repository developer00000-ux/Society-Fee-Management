import Link from 'next/link'

export default function Navbar() {
  return (
    <div className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="cursor-pointer hover:text-blue-300 transition-colors">
            <h1 className="text-xl font-semibold">Society Fee Management</h1>
          </Link>
        </div>
        <div className="flex space-x-4">
          <Link 
            href="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Add New Entry
          </Link>
          <Link 
            href="/entries" 
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          >
            View All Entries
          </Link>
          <Link 
            href="/admin" 
            className="bg-white text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  )
} 