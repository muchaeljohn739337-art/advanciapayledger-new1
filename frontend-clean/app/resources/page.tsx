'use client'

export default function Resources() {
  const resources = [
    {
      category: 'Documentation',
      items: [
        { title: 'API Documentation', description: 'Complete API reference and examples', icon: '📚' },
        { title: 'Integration Guide', description: 'Step-by-step integration instructions', icon: '🔧' },
        { title: 'Security Whitepaper', description: 'Detailed security and compliance information', icon: '🔒' },
        { title: 'SDK & Libraries', description: 'Official SDKs for popular languages', icon: '💻' }
      ]
    },
    {
      category: 'Healthcare Compliance',
      items: [
        { title: 'HIPAA Compliance', description: 'Understanding HIPAA requirements', icon: '🏥' },
        { title: 'PCI-DSS Guide', description: 'Payment card industry standards', icon: '💳' },
        { title: 'GDPR Documentation', description: 'Data protection and privacy', icon: '🛡️' },
        { title: 'Audit Trail Guide', description: 'Comprehensive audit logging', icon: '📋' }
      ]
    },
    {
      category: 'Support',
      items: [
        { title: 'Help Center', description: 'Frequently asked questions and answers', icon: '❓' },
        { title: 'Video Tutorials', description: 'Step-by-step video guides', icon: '🎥' },
        { title: 'Community Forum', description: 'Connect with other users', icon: '👥' },
        { title: 'Contact Support', description: 'Get help from our support team', icon: '📞' }
      ]
    }
  ]

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
              <a href='/features' className='text-gray-300 hover:text-white transition-colors'>Features</a>
              <a href='/pricing' className='text-gray-300 hover:text-white transition-colors'>Pricing</a>
              <a href='/resources' className='text-blue-400 font-semibold'>Resources</a>
              <a href='/blog' className='text-gray-300 hover:text-white transition-colors'>Blog</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Resources Content */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h1 className='text-5xl font-bold text-white mb-6'>
              Resources & Documentation
            </h1>
            <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
              Everything you need to succeed with Advancia PayLedger
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16'>
            {resources.map((category, categoryIndex) => (
              <div key={categoryIndex} className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-gray-700'>
                <h3 className='text-xl font-semibold text-white mb-6'>{category.category}</h3>
                <div className='space-y-4'>
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className='bg-gray-700 bg-opacity-50 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer'>
                      <div className='flex items-start space-x-3'>
                        <div className='text-2xl'>{item.icon}</div>
                        <div>
                          <h4 className='text-white font-semibold mb-1'>{item.title}</h4>
                          <p className='text-gray-400 text-sm'>{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Start */}
          <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-gray-700 mb-16'>
            <h2 className='text-3xl font-bold text-white mb-6 text-center'>Quick Start Guide</h2>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div className='text-center'>
                <div className='bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  1
                </div>
                <h3 className='text-white font-semibold mb-2'>Sign Up</h3>
                <p className='text-gray-400 text-sm'>Create your account in minutes</p>
              </div>
              <div className='text-center'>
                <div className='bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  2
                </div>
                <h3 className='text-white font-semibold mb-2'>Connect Wallet</h3>
                <p className='text-gray-400 text-sm'>Link your cryptocurrency wallets</p>
              </div>
              <div className='text-center'>
                <div className='bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  3
                </div>
                <h3 className='text-white font-semibold mb-2'>Configure</h3>
                <p className='text-gray-400 text-sm'>Set up your facility and payment methods</p>
              </div>
              <div className='text-center'>
                <div className='bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  4
                </div>
                <h3 className='text-white font-semibold mb-2'>Start Processing</h3>
                <p className='text-gray-400 text-sm'>Begin accepting crypto payments</p>
              </div>
            </div>
          </div>

          {/* Support CTA */}
          <div className='text-center'>
            <h2 className='text-3xl font-bold text-white mb-4'>
              Need Help Getting Started?
            </h2>
            <p className='text-gray-300 mb-8'>
              Our support team is here to help you every step of the way.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors'>
                Contact Support
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
