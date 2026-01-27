'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('advancia-token')
    if (!storedToken) {
      router.push('/login')
      return
    }
    setToken(storedToken)
    
    // Fetch dashboard data
    fetchDashboardData(storedToken)
  }, [])

  const fetchDashboardData = async (authToken) => {
    try {
      setLoading(true)
      
      // Fetch user data
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const userData = await userResponse.json()
      
      // Fetch metrics
      const metricsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const metricsData = await metricsResponse.json()
      
      // Fetch transactions
      const transactionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/transactions?limit=5`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const transactionsData = await transactionsResponse.json()
      
      // Fetch facilities
      const facilitiesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/facilities?limit=5`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const facilitiesData = await facilitiesResponse.json()
      
      if (userData.success) setUser(userData.data)
      if (metricsData.success) setMetrics(metricsData.data)
      if (transactionsData.success) setTransactions(transactionsData.data.transactions)
      if (facilitiesData.success) setFacilities(facilitiesData.data.facilities)
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('advancia-token')
    router.push('/login')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
        <div className='text-white text-2xl'>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      {/* Header */}
      <header className='bg-gray-800 border-b border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center space-x-4'>
              <h1 className='text-2xl font-bold text-blue-400'>💰 Advancia PayLedger</h1>
              <span className='text-gray-400'>Admin Dashboard</span>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-gray-300'>Welcome, {user?.firstName}</span>
              <button
                onClick={handleLogout}
                className='bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Metrics Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-gray-800 rounded-lg p-6 border border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Monthly Revenue</p>
                <p className='text-3xl font-bold text-green-400'>{formatCurrency(metrics?.mrr || 0)}</p>
                <p className='text-green-400 text-sm'>+{metrics?.growth || 0}% MoM</p>
              </div>
              <div className='text-green-400 text-3xl'>📈</div>
            </div>
          </div>

          <div className='bg-gray-800 rounded-lg p-6 border border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Active Facilities</p>
                <p className='text-3xl font-bold text-blue-400'>{metrics?.facilities || 0}</p>
                <p className='text-blue-400 text-sm'>{metrics?.states || 0} states</p>
              </div>
              <div className='text-blue-400 text-3xl'>🏥</div>
            </div>
          </div>

          <div className='bg-gray-800 rounded-lg p-6 border border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Transaction Volume</p>
                <p className='text-3xl font-bold text-purple-400'>{formatCurrency(metrics?.transactions || 0)}</p>
                <p className='text-purple-400 text-sm'>{metrics?.completedTransactions || 0} completed</p>
              </div>
              <div className='text-purple-400 text-3xl'>💳</div>
            </div>
          </div>

          <div className='bg-gray-800 rounded-lg p-6 border border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Active Users</p>
                <p className='text-3xl font-bold text-orange-400'>{metrics?.activeUsers || 0}</p>
                <p className='text-orange-400 text-sm'>{metrics?.pendingTransactions || 0} pending</p>
              </div>
              <div className='text-orange-400 text-3xl'>👥</div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          <div className='bg-gray-800 rounded-lg p-6 border border-gray-700'>
            <h2 className='text-xl font-semibold mb-4 text-blue-400'>Recent Transactions</h2>
            <div className='space-y-3'>
              {transactions.map((transaction) => (
                <div key={transaction.id} className='flex justify-between items-center p-3 bg-gray-700 rounded-lg'>
                  <div>
                    <p className='font-medium'>{transaction.facility}</p>
                    <p className='text-sm text-gray-400'>{transaction.type}</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-green-400'>{formatCurrency(transaction.amount)}</p>
                    <p className={`text-xs px-2 py-1 rounded ${
                      transaction.status === 'COMPLETED' ? 'bg-green-600' : 
                      transaction.status === 'PENDING' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Facilities */}
          <div className='bg-gray-800 rounded-lg p-6 border border-gray-700'>
            <h2 className='text-xl font-semibold mb-4 text-blue-400'>Active Facilities</h2>
            <div className='space-y-3'>
              {facilities.map((facility) => (
                <div key={facility.id} className='flex justify-between items-center p-3 bg-gray-700 rounded-lg'>
                  <div>
                    <p className='font-medium'>{facility.name}</p>
                    <p className='text-sm text-gray-400'>{facility.state} • {facility.beds} beds</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-blue-400'>{formatCurrency(facility.mrr)}</p>
                    <p className='text-xs px-2 py-1 bg-green-600 rounded'>ACTIVE</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-gray-800 rounded-lg p-6 border border-gray-700'>
          <h2 className='text-xl font-semibold mb-4 text-blue-400'>Quick Actions</h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <button className='bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition-colors'>
              <span className='text-2xl mb-2 block'>➕</span>
              New Transaction
            </button>
            <button className='bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg transition-colors'>
              <span className='text-2xl mb-2 block'>🏥</span>
              Add Facility
            </button>
            <button className='bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg transition-colors'>
              <span className='text-2xl mb-2 block'>📊</span>
              View Analytics
            </button>
            <button className='bg-orange-600 hover:bg-orange-700 px-4 py-3 rounded-lg transition-colors'>
              <span className='text-2xl mb-2 block'>⚙️</span>
              Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
