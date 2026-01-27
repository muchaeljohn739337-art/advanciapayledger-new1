'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleDemoRequest = (e) => {
    e.preventDefault()
    // Handle demo request
    router.push('/demo-requested')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900'>
      {/* Navigation */}
      <nav className='bg-gray-900 bg-opacity-90 backdrop-blur-lg border-b border-gray-800'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center space-x-2'>
              <div className='text-3xl'>💰</div>
              <span className='text-xl font-bold text-white'>Advancia PayLedger</span>
            </div>
            <div className='hidden md:flex space-x-8'>
              <a href='#features' className='text-gray-300 hover:text-white transition-colors'>Features</a>
              <a href='#pricing' className='text-gray-300 hover:text-white transition-colors'>Pricing</a>
              <a href='#resources' className='text-gray-300 hover:text-white transition-colors'>Resources</a>
              <a href='#blog' className='text-gray-300 hover:text-white transition-colors'>Blog</a>
            </div>
            <div className='flex space-x-4'>
              <button className='text-gray-300 hover:text-white transition-colors'>Sign In</button>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors'>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <div className='mb-8'>
            <h1 className='text-5xl md:text-7xl font-bold text-white mb-6'>
              Global Financial Transformation
              <span className='block text-blue-400'>for Healthcare</span>
            </h1>
            <p className='text-xl text-gray-300 mb-8 max-w-3xl mx-auto'>
              The only crypto + healthcare payment platform processing $2.8M+ in transactions 
              across 24 facilities with 42% month-over-month growth.
            </p>
          </div>

          {/* Key Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
            <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-gray-700'>
              <div className='text-4xl font-bold text-green-400 mb-2'>$247K</div>
              <div className='text-gray-300'>Monthly Revenue</div>
              <div className='text-green-400 text-sm'>+42% MoM</div>
            </div>
            <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-gray-700'>
              <div className='text-4xl font-bold text-blue-400 mb-2'>24</div>
              <div className='text-gray-300'>Active Facilities</div>
              <div className='text-blue-400 text-sm'>8 States</div>
            </div>
            <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-gray-700'>
              <div className='text-4xl font-bold text-purple-400 mb-2'>$2.8M+</div>
              <div className='text-gray-300'>Transaction Volume</div>
              <div className='text-purple-400 text-sm'>98% Success Rate</div>
            </div>
          </div>

          {/* CTA */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-16'>
            <button className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors'>
              Request Demo
            </button>
            <button className='bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors border border-gray-600'>
              View Pricing
            </button>
          </div>

          {/* Demo Form */}
          <div className='max-w-md mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-gray-700'>
            <h3 className='text-xl font-semibold text-white mb-4'>Get Your Free Demo</h3>
            <form onSubmit={handleDemoRequest} className='space-y-4'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
              <button
                type='submit'
                className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors'
              >
                Schedule Demo
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section id='features' className='py-20 px-4 bg-gray-900 bg-opacity-50'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-white text-center mb-12'>
            Transform Healthcare Payments
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='text-4xl mb-4'>🏥</div>
              <h3 className='text-xl font-semibold text-white mb-2'>Healthcare Focused</h3>
              <p className='text-gray-300'>Built specifically for healthcare facilities with HIPAA compliance</p>
            </div>
            <div className='text-center'>
              <div className='text-4xl mb-4'>💳</div>
              <h3 className='text-xl font-semibold text-white mb-2'>Crypto Payments</h3>
              <p className='text-gray-300'>Accept 5+ cryptocurrencies with instant settlement</p>
            </div>
            <div className='text-center'>
              <div className='text-4xl mb-4'>🤖</div>
              <h3 className='text-xl font-semibold text-white mb-2'>AI Security</h3>
              <p className='text-gray-300'>25+ AI agents protecting transactions 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 border-t border-gray-800 py-12 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <div className='flex items-center justify-center space-x-2 mb-4'>
            <div className='text-2xl'>💰</div>
            <span className='text-lg font-semibold text-white'>Advancia PayLedger</span>
          </div>
          <p className='text-gray-400'>© 2024 Advancia PayLedger. Global Financial Transformation Platform.</p>
        </div>
      </footer>
    </div>
  )
}
