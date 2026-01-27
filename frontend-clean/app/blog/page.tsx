'use client'

import { useState } from 'react'

export default function Blog() {
  const posts = [
    {
      title: 'The Future of Healthcare Payments: Cryptocurrency Integration',
      excerpt: 'Exploring how blockchain technology is revolutionizing healthcare payment processing and why forward-thinking facilities are adopting crypto payments.',
      date: 'January 15, 2024',
      author: 'Michael Chen',
      category: 'Industry Trends',
      readTime: '5 min read'
    },
    {
      title: 'HIPAA Compliance in the Age of Digital Payments',
      excerpt: 'Understanding how to maintain HIPAA compliance while implementing modern payment solutions and cryptocurrency processing.',
      date: 'January 10, 2024',
      author: 'Sarah Johnson',
      category: 'Compliance',
      readTime: '7 min read'
    },
    {
      title: 'Case Study: How Medical Center Reduced Processing Costs by 81%',
      excerpt: 'A deep dive into how a regional medical center transformed their payment processing and achieved significant cost savings.',
      date: 'January 5, 2024',
      author: 'David Kim',
      category: 'Case Studies',
      readTime: '10 min read'
    },
    {
      title: 'Multi-Chain Strategy: Why Healthcare Facilities Need More Than Bitcoin',
      excerpt: 'Exploring the benefits of supporting multiple cryptocurrencies and how it impacts payment processing efficiency.',
      date: 'December 28, 2023',
      author: 'Michael Chen',
      category: 'Technology',
      readTime: '6 min read'
    },
    {
      title: 'Security Best Practices for Crypto Healthcare Payments',
      excerpt: 'Essential security measures every healthcare facility should implement when processing cryptocurrency payments.',
      date: 'December 20, 2023',
      author: 'Security Team',
      category: 'Security',
      readTime: '8 min read'
    },
    {
      title: '2024 Healthcare Fintech Predictions',
      excerpt: 'Our predictions for the future of healthcare payment processing and emerging technologies to watch.',
      date: 'December 15, 2023',
      author: 'Research Team',
      category: 'Predictions',
      readTime: '6 min read'
    }
  ]

  const categories = ['All', 'Industry Trends', 'Compliance', 'Case Studies', 'Technology', 'Security', 'Predictions']
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory)

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
              <a href='/resources' className='text-gray-300 hover:text-white transition-colors'>Resources</a>
              <a href='/blog' className='text-blue-400 font-semibold'>Blog</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Blog Content */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h1 className='text-5xl font-bold text-white mb-6'>
              Advancia PayLedger Blog
            </h1>
            <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
              Insights, trends, and best practices for healthcare payment innovation
            </p>
          </div>

          {/* Category Filter */}
          <div className='flex flex-wrap justify-center gap-2 mb-12'>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
            {filteredPosts.map((post, index) => (
              <article key={index} className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer'>
                <div className='flex items-center justify-between mb-4'>
                  <span className='text-blue-400 text-sm font-medium'>{post.category}</span>
                  <span className='text-gray-400 text-sm'>{post.readTime}</span>
                </div>
                <h3 className='text-xl font-semibold text-white mb-3 line-clamp-2'>
                  {post.title}
                </h3>
                <p className='text-gray-300 mb-4 line-clamp-3'>
                  {post.excerpt}
                </p>
                <div className='flex items-center justify-between text-sm text-gray-400'>
                  <div>
                    <span>{post.author}</span>
                    <span className='mx-2'>•</span>
                    <span>{post.date}</span>
                  </div>
                  <button className='text-blue-400 hover:text-blue-300 transition-colors'>
                    Read More →
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className='bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-gray-700 text-center'>
            <h2 className='text-3xl font-bold text-white mb-4'>
              Stay Updated on Healthcare Fintech
            </h2>
            <p className='text-gray-300 mb-6 max-w-2xl mx-auto'>
              Get the latest insights, trends, and updates delivered straight to your inbox.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 max-w-md mx-auto'>
              <input
                type='email'
                placeholder='Enter your email'
                className='flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors'>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
