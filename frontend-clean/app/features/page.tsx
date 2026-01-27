'use client'

export default function Features() {
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
              <a href='/' className='text-gray-300 hover:text-white transition-colors'>Home</a>
              <a href='/features' className='text-blue-400 font-semibold'>Features</a>
              <a href='/pricing' className='text-gray-300 hover:text-white transition-colors'>Pricing</a>
              <a href='/resources' className='text-gray-300 hover:text-white transition-colors'>Resources</a>
              <a href='/blog' className='text-gray-300 hover:text-white transition-colors'>Blog</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Features Content */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h1 className='text-5xl font-bold text-white mb-6'>
              Complete Healthcare Payment Solution
            </h1>
            <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
              Everything you need to modernize healthcare payments with cryptocurrency integration
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Multi-Chain Payments */}
            <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-gray-700'>
              <div className='text-4xl mb-4'>⛓️</div>
              <h3 className='text-xl font-semibold text-white mb-4'>Multi-Chain Support</h3>
              <ul className='text-gray-300 space-y-2'>
                <li>• Ethereum & ERC-20 tokens</li>
                <li>• Polygon for low fees</li>
                <li>• Solana for speed</li>
                <li>• Base & Arbitrum</li>
                <li>• Stellar for stability</li>
              </ul>
            </div>

            {/* Healthcare Management */}
            <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-gray-700'>
              <div className='text-4xl mb-4'>🏥</div>
              <h3 className='text-xl font-semibold text-white mb-4'>Facility Management</h3>
              <ul className='text-gray-300 space-y-2'>
                <li>• Multi-location support</li>
                <li>• Patient payment tracking</li>
                <li>• Staff payment processing</li>
                <li>• Supply chain payments</li>
                <li>• Insurance integration</li>
              </ul>
            </div>

            {/* AI Security */}
            <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-gray-700'>
              <div className='text-4xl mb-4'>🤖</div>
              <h3 className='text-xl font-semibold text-white mb-4'>AI-Powered Security</h3>
              <ul className='text-gray-300 space-y-2'>
                <li>• 25+ security agents</li>
                <li>• Fraud detection</li>
                <li>• Compliance monitoring</li>
                <li>• Risk assessment</li>
                <li>• Real-time alerts</li>
              </ul>
            </div>

            {/* Debit Card System */}
            <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-gray-700'>
              <div className='text-4xl mb-4'>💳</div>
              <h3 className='text-xl font-semibold text-white mb-4'>Debit Card Program</h3>
              <ul className='text-gray-300 space-y-2'>
                <li>• Virtual & physical cards</li>
                <li>• Instant crypto funding</li>
                <li>• POS terminal integration</li>
                <li>• Expense management</li>
                <li>• Rewards program</li>
              </ul>
            </div>

            {/* Real-Time Analytics */}
            <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-gray-700'>
              <div className='text-4xl mb-4'>📊</div>
              <h3 className='text-xl font-semibold text-white mb-4'>Advanced Analytics</h3>
              <ul className='text-gray-300 space-y-2'>
                <li>• Real-time dashboards</li>
                <li>• Revenue tracking</li>
                <li>• Transaction analytics</li>
                <li>• Growth metrics</li>
                <li>• Custom reports</li>
              </ul>
            </div>

            {/* Compliance */}
            <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-gray-700'>
              <div className='text-4xl mb-4'>🔒</div>
              <h3 className='text-xl font-semibold text-white mb-4'>Compliance & Security</h3>
              <ul className='text-gray-300 space-y-2'>
                <li>• HIPAA compliant</li>
                <li>• PCI-DSS certified</li>
                <li>• GDPR ready</li>
                <li>• SOC 2 Type 2</li>
                <li>• Audit trails</li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className='text-center mt-16'>
            <h2 className='text-3xl font-bold text-white mb-4'>
              Ready to Transform Your Payments?
            </h2>
            <p className='text-gray-300 mb-8'>
              Join 24 healthcare facilities already using Advancia PayLedger
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors'>
                Start Free Trial
              </button>
              <button className='bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors border border-gray-600'>
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
