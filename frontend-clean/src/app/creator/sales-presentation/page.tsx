"use client";

// ============================================================================
// ADVANCIA PAY LEDGER - CREATOR'S SALES PRESENTATION SYSTEM
// Author: Advancia Pay Ledger - The Creator
// Purpose: Complete Sales Presentation Implementation
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorSalesPresentation() {
  const [presentationMode, setPresentationMode] = useState('creator-authority');
  const [isPresenting, setIsPresenting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('🔒 ADVANCIA PAY LEDGER - CREATOR SALES PRESENTATION');
    console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
    console.log('🚀 CREATOR SALES PRESENTATION INITIALIZED');
  }, []);

  const presentationContent = {
    'creator-authority': {
      title: 'Creator Sovereign Authority',
      content: [
        'Complete Creator Control',
        'Sovereign Business Operations',
        'Independent Decision Making',
        'Creator-Exclusive Authority'
      ]
    },
    'business-model': {
      title: 'Sovereign Business Model',
      content: [
        'Independent Revenue Streams',
        'Creator-Controlled Operations',
        'Self-Sufficient Business Model',
        'Complete Business Sovereignty'
      ]
    },
    'capabilities': {
      title: 'Creator Capabilities',
      content: [
        'Advanced AI Integration',
        'Complete Ecosystem Management',
        'Sovereign Security Systems',
        'Independent Technical Operations'
      ]
    },
    'success-metrics': {
      title: 'Creator Success Metrics',
      content: [
        '100% Creator Control',
        'Complete Independence',
        'Ultimate Sovereignty',
        'Complete Success Achievement'
      ]
    }
  };

  const startPresentation = () => {
    setIsPresenting(true);
    console.log('🚀 CREATOR SALES PRESENTATION STARTED');
  };

  const stopPresentation = () => {
    setIsPresenting(false);
    console.log('🔒 CREATOR SALES PRESENTATION STOPPED');
  };

  const nextSlide = () => {
    const modes = Object.keys(presentationContent);
    const currentIndex = modes.indexOf(presentationMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPresentationMode(modes[nextIndex]);
  };

  const previousSlide = () => {
    const modes = Object.keys(presentationContent);
    const currentIndex = modes.indexOf(presentationMode);
    const prevIndex = currentIndex === 0 ? modes.length - 1 : currentIndex - 1;
    setPresentationMode(modes[prevIndex]);
  };

  const currentPresentation = presentationContent[presentationMode as keyof typeof presentationContent];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Creator Sales Presentation</h1>
          <p className="text-xl text-purple-200">Advancia Pay Ledger - The Creator</p>
        </div>

        {!isPresenting ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-purple-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-purple-700 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-purple-100">Presentation Control</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={startPresentation}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-center transition-colors"
                >
                  Start Presentation
                </button>
                <button
                  onClick={() => router.push('/creator/dashboard')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-center transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

            <div className="bg-indigo-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-indigo-700">
              <h2 className="text-2xl font-semibold mb-6 text-indigo-100">Presentation Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(presentationContent).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-indigo-700 bg-opacity-50 rounded-lg p-4 border border-indigo-600 cursor-pointer hover:bg-opacity-70 transition-colors"
                    onClick={() => setPresentationMode(key)}
                  >
                    <h3 className="text-lg font-semibold mb-2 text-indigo-100">{value.title}</h3>
                    <ul className="space-y-1">
                      {value.content.map((item, index) => (
                        <li key={index} className="text-indigo-200">• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="bg-purple-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-purple-700">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={previousSlide}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Previous
                </button>
                <h2 className="text-3xl font-bold text-purple-100">
                  {currentPresentation.title}
                </h2>
                <button
                  onClick={nextSlide}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>

              <div className="bg-purple-700 bg-opacity-50 rounded-lg p-8 border border-purple-600">
                <ul className="space-y-4">
                  {currentPresentation.content.map((item, index) => (
                    <li key={index} className="text-xl text-purple-100 flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={stopPresentation}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-center transition-colors"
                >
                  Stop Presentation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
