'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('advancia-token', data.token)
        localStorage.setItem('advancia-user', JSON.stringify(data.user))
        router.push('/dashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 flex items-center justify-center px-4'>
      <div className='max-w-md w-full'>
        {/* Logo and Title */}
        <div className='text-center mb-8'>
          <div className='text-6xl mb-4'>💰</div>
          <h1 className='text-4xl font-bold text-white mb-2'>Advancia PayLedger</h1>
          <p className='text-gray-300'>Admin Dashboard Login</p>
        </div>

        {/* Login Form */}
        <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Email Address
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='admin@advancia.com'
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter your password'
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className='bg-red-600 bg-opacity-20 border border-red-600 text-red-300 px-4 py-3 rounded-lg'>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center'
            >
              {loading ? (
                <div className='flex items-center space-x-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className='mt-6 p-4 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600'>
            <p className='text-sm text-gray-300 mb-2'>Demo Credentials:</p>
            <div className='text-xs text-gray-400 space-y-1'>
              <p>Email: admin@advancia.com</p>
              <p>Password: Admin123!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='text-center mt-8'>
          <p className='text-gray-400 text-sm'>
            Global Financial Transformation Platform
          </p>
          <p className='text-gray-500 text-xs mt-2'>
            © 2024 Advancia PayLedger. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
