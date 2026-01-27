'use client'

import { useState } from 'react'

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly')

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small clinics',
      price: billingCycle === 'monthly' ? 299 : 2990,
      features: [
        'Up to 50 transactions/month',
        '2 cryptocurrency chains',
        'Basic analytics dashboard',
        'Email support',
        'HIPAA compliance',
        'Mobile app access'
      ],
      popular: false
    },
    {
      name: 'Growth',
      description: 'Ideal for growing facilities',
      price: billingCycle === 'monthly' ? 799 : 7990,
      features: [
        'Up to 500 transactions/month',
        'All 5+ cryptocurrency chains',
        'Advanced analytics & reporting',
        'Priority support',
        'AI security monitoring',
        'Debit card program',
        'Multi-location support',
        'API access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'For large healthcare systems',
      price: billingCycle === 'monthly' ? 1999 : 19990,
      features: [
        'Unlimited transactions',
        'All cryptocurrency chains',
        'Custom analytics & BI',
        '24/7 dedicated support',
        'Advanced AI security suite',
        'White-label solutions',
        'Unlimited locations',
        'Full API & webhooks',
        'Custom integrations',
        'On-premise option'
      ],
      popular: false
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
              <a href='/pricing' className='text-blue-400 font-semibold'>Pricing</a>
              <a href='/resources' className='text-gray-300 hover:text-white transition-colors'>Resources</a>
              <a href='/blog' className='text-gray-300 hover:text-white transition-colors'>Blog</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Content */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h1 className='text-5xl font-bold text-white mb-6'>
              Transparent Pricing for Healthcare
            </h1>
            <p className='text-xl text-gray-300 max-w-3xl mx-auto mb-8'>
              Choose the perfect plan for your facility. No hidden fees, cancel anytime.
            </p>
            
            {/* Billing Toggle */}
            <div className='flex items-center justify-center space-x-4'>
              <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className='relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg ${billingCycle === 'annual' ? 'text-white' : 'text-gray-400'}`}>
                Annual <span className='text-green-400 text-sm'> (Save 10%)</span>
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border ${
                  plan.popular ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'
                } relative`}
              >
                {plan.popular && (
                  <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                    <span className='bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold'>
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className='text-center mb-8'>
                  <h3 className='text-2xl font-bold text-white mb-2'>{plan.name}</h3>
                  <p className='text-gray-400 mb-4'>{plan.description}</p>
                  <div className='text-4xl font-bold text-white mb-2'>
                    ${plan.price}
                    <span className='text-lg text-gray-400'>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                </div>

                <ul className='space-y-3 mb-8'>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className='flex items-center text-gray-300'>
                      <span className='text-green-400 mr-2'>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className='mt-16 text-center'>
            <h3 className='text-2xl font-bold text-white mb-4'>
              Not sure which plan is right for you?
            </h3>
            <p className='text-gray-300 mb-8'>
              Our team can help you choose the perfect solution for your healthcare facility.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors'>
                Schedule Consultation
              </button>
              <button className='bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors border border-gray-600'>
                View Feature Comparison
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
