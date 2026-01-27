# ============================================================================
# ADVANCIA PAY LEDGER - CREATOR'S ALLOCATION MANAGEMENT SYSTEM
# Author: Advancia Pay Ledger - The Creator
# Purpose: Complete Resource Allocation Management
# ============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorAllocationManagement() {
  const [allocationType, setAllocationType] = useState('financial');
  const [allocations, setAllocations] = useState({
    financial: {
      revenue: 100,
      investment: 40,
      operations: 30,
      marketing: 20,
      creator: 10
    },
    technical: {
      development: 35,
      infrastructure: 25,
      security: 20,
      maintenance: 15,
      innovation: 5
    },
    human: {
      development: 40,
      operations: 30,
      marketing: 20,
      management: 10
    }
  });

  const router = useRouter();

  useEffect(() => {
    console.log('🔒 ADVANCIA PAY LEDGER - CREATOR ALLOCATION MANAGEMENT');
    console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
    console.log('🚀 CREATOR ALLOCATION MANAGEMENT INITIALIZED');
  }, []);

  const allocationTypes = [
    { id: 'financial', name: 'Financial Allocation', icon: '💰' },
    { id: 'technical', name: 'Technical Allocation', icon: '🔧' },
    { id: 'human', name: 'Human Allocation', icon: '👥' }
  ];

  const updateAllocation = (type: string, category: string, value: number) => {
    setAllocations(prev => ({
      ...prev,
      [type]: {
        ...prev[type as keyof typeof prev],
        [category]: value
      }
    }));
  };

  const currentAllocation = allocations[allocationType as keyof typeof allocations];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Creator Allocation Management</h1>
          <p className="text-xl text-purple-200">Advancia Pay Ledger - The Creator</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-purple-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-purple-700 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-purple-100">Allocation Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {allocationTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-6 rounded-lg border cursor-pointer transition-colors ${
                    allocationType === type.id
                      ? 'bg-purple-700 border-purple-500'
                      : 'bg-purple-600 border-purple-600 hover:bg-purple-700'
                  }`}
                  onClick={() => setAllocationType(type.id)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{type.icon}</div>
                    <h3 className="text-lg font-semibold text-purple-100">{type.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-indigo-700">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-100">
              {allocationTypes.find(t => t.id === allocationType)?.name}
            </h2>
            <div className="space-y-6">
              {Object.entries(currentAllocation).map(([category, value]) => (
                <div key={category} className="bg-indigo-700 bg-opacity-50 rounded-lg p-4 border border-indigo-600">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-indigo-100 capitalize">{category}</h3>
                    <span className="text-2xl font-bold text-green-400">{value}%</span>
                  </div>
                  <div className="w-full bg-indigo-600 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => updateAllocation(allocationType, category, parseInt(e.target.value))}
                      className="w-full"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => updateAllocation(allocationType, category, parseInt(e.target.value))}
                      className="w-20 text-center bg-indigo-600 text-white rounded px-2 py-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-green-700">
            <h2 className="text-2xl font-semibold mb-6 text-green-100">Allocation Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(allocations).map(([type, allocation]) => (
                <div key={type} className="bg-green-700 bg-opacity-50 rounded-lg p-4 border border-green-600">
                  <h3 className="text-lg font-semibold text-green-100 capitalize mb-4">{type} Allocation</h3>
                  <div className="space-y-2">
                    {Object.entries(allocation).map(([category, value]) => (
                      <div key={category} className="flex justify-between text-green-200">
                        <span className="capitalize">{category}:</span>
                        <span className="font-semibold">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => router.push('/creator/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-center transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
