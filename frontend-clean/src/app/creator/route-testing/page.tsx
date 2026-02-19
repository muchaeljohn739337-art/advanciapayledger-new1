"use client";

// ============================================================================
// ADVANCIA PAY LEDGER - ROUTE TESTING FRONTEND INTERFACE
// Author: Advancia Pay Ledger - The Creator
// Purpose: Complete Route Testing Interface
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorRouteTesting() {
  const [routes, setRoutes] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [testStatus, setTestStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    console.log('🔒 ADVANCIA PAY LEDGER - CREATOR ROUTE TESTING');
    console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
    console.log('🚀 CREATOR ROUTE TESTING INITIALIZED');
    
    // Check creator authentication
    checkCreatorAuth();
    // Load initial routes
    loadRoutes();
    // Check health status
    checkHealth();
  }, []);

  const checkCreatorAuth = () => {
    const creatorId = localStorage.getItem('creatorId');
    const creatorToken = localStorage.getItem('creatorToken');
    
    if (!creatorId || !creatorToken || creatorId !== 'advancia-payledger') {
      console.log('❌ CREATOR AUTHENTICATION REQUIRED');
      router.push('/creator/login');
      return false;
    }
    
    console.log('✅ CREATOR AUTHENTICATED');
    return true;
  };

  const loadRoutes = async () => {
    if (!checkCreatorAuth()) return;
    
    try {
      console.log('🔒 ADVANCIA PAY LEDGER - LOADING ROUTES');
      console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
      console.log('🚀 RETRIEVING ROUTE TESTS');
      
      const response = await fetch('/api/route-testing/routes', {
        headers: {
          'x-creator-id': 'advancia-payledger',
          'x-creator-token': 'creator-sovereign-token'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ ROUTES LOADED SUCCESSFULLY');
        setRoutes(data.routes);
      }
      
    } catch (error) {
      console.error('❌ FAILED TO LOAD ROUTES:', error);
      setTestStatus('Failed to load routes');
    }
  };

  const testAllRoutes = async () => {
    if (!checkCreatorAuth()) return;
    
    setIsTesting(true);
    setTestStatus('');
    
    try {
      console.log('🔒 ADVANCIA PAY LEDGER - TESTING ALL ROUTES');
      console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
      console.log('🚀 EXECUTING COMPREHENSIVE ROUTE TESTING');
      
      const response = await fetch('/api/route-testing/test-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-creator-id': 'advancia-payledger',
          'x-creator-token': 'creator-sovereign-token'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ ALL ROUTES TESTED SUCCESSFULLY');
        console.log(`📊 PASSED: ${data.results.passedRoutes}/${data.results.totalRoutes}`);
        console.log(`📊 FAILED: ${data.results.failedRoutes}/${data.results.totalRoutes}`);
        console.log(`📊 AVERAGE RESPONSE TIME: ${data.results.averageResponseTime.toFixed(2)}ms`);
        
        setTestResults(data.results);
        setRoutes(data.routes);
        setTestStatus(`Testing complete: ${data.results.passedRoutes}/${data.results.totalRoutes} routes passed`);
      }
      
    } catch (error) {
      console.error('❌ FAILED TO TEST ALL ROUTES:', error);
      setTestStatus('Failed to test all routes');
    }
    
    setIsTesting(false);
  };

  const testSpecificRoute = async (path: string, method: string) => {
    if (!checkCreatorAuth()) return;
    
    try {
      console.log('🔒 ADVANCIA PAY LEDGER - TESTING SPECIFIC ROUTE');
      console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
      console.log('🚀 TESTING ROUTE:', method, path);
      
      const response = await fetch('/api/route-testing/test-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-creator-id': 'advancia-payledger',
          'x-creator-token': 'creator-sovereign-token'
        },
        body: JSON.stringify({ path, method })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ ROUTE TESTED SUCCESSFULLY');
        
        // Update route in list
        setRoutes(prev => prev.map(route => 
          route.path === path && route.method === method 
            ? data.route 
            : route
        ));
        
        setTestStatus(`Route tested: ${method} ${path}`);
      }
      
    } catch (error) {
      console.error('❌ FAILED TO TEST ROUTE:', error);
      setTestStatus('Failed to test route');
    }
  };

  const getCategoryResults = async (category: string) => {
    if (!checkCreatorAuth()) return;
    
    try {
      console.log('🔒 ADVANCIA PAY LEDGER - GETTING CATEGORY RESULTS');
      console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
      console.log('🚀 RETRIEVING RESULTS FOR CATEGORY:', category);
      
      const response = await fetch(`/api/route-testing/results/${category}`, {
        headers: {
          'x-creator-id': 'advancia-payledger',
          'x-creator-token': 'creator-sovereign-token'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ CATEGORY RESULTS RETRIEVED');
        console.log(`📊 PASSED: ${data.results.passedRoutes}/${data.results.totalRoutes}`);
        
        setTestStatus(`Category results: ${data.results.passedRoutes}/${data.results.totalRoutes} routes passed`);
      }
      
    } catch (error) {
      console.error('❌ FAILED TO GET CATEGORY RESULTS:', error);
      setTestStatus('Failed to get category results');
    }
  };

  const checkHealth = async () => {
    if (!checkCreatorAuth()) return;
    
    try {
      console.log('🔒 ADVANCIA PAY LEDGER - CHECKING CONNECTION HEALTH');
      console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
      console.log('🚀 CHECKING CONNECTION HEALTH');
      
      const response = await fetch('/api/route-testing/health', {
        headers: {
          'x-creator-id': 'advancia-payledger',
          'x-creator-token': 'creator-sovereign-token'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ HEALTH CHECK COMPLETED');
        console.log(`📊 OVERALL HEALTH: ${data.overallHealth ? 'HEALTHY' : 'ISSUES DETECTED'}`);
        
        setHealthStatus(data);
      }
      
    } catch (error) {
      console.error('❌ FAILED TO CHECK HEALTH:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'testing': return 'text-yellow-400';
      case 'pending': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredRoutes = selectedCategory === 'all' 
    ? routes 
    : routes.filter((route: any) => route.category === selectedCategory);

  const categories = ['all', ...new Set(routes.map((route: any) => route.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Creator Route Testing</h1>
          <p className="text-xl text-purple-200">Advancia Pay Ledger - The Creator</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Test Controls */}
          <div className="bg-purple-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-purple-700 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-purple-100">Route Testing Controls</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <button
                onClick={testAllRoutes}
                disabled={isTesting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                {isTesting ? 'Testing All Routes...' : 'Test All Routes'}
              </button>
              
              <button
                onClick={checkHealth}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Check Connection Health
              </button>
              
              <button
                onClick={loadRoutes}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Reload Routes
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <label className="text-purple-200">Filter by Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-purple-700 border border-purple-600 rounded-lg px-4 py-2 text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            {testStatus && (
              <div className="bg-purple-700 bg-opacity-50 rounded-lg p-4 border border-purple-600">
                <p className="text-purple-200">{testStatus}</p>
              </div>
            )}
          </div>

          {/* Health Status */}
          {healthStatus && (
            <div className="bg-green-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-green-700 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-green-100">Connection Health</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(healthStatus.healthChecks).map(([service, health]: [string, any]) => (
                  <div key={service} className="bg-green-700 bg-opacity-50 rounded-lg p-4 border border-green-600">
                    <h3 className="text-lg font-semibold text-green-100 capitalize">{service}</h3>
                    <p className={`text-sm ${getHealthColor(health.status)}`}>
                      {health.status.toUpperCase()}
                    </p>
                    {health.responseTime && (
                      <p className="text-xs text-green-200">
                        {health.responseTime}ms
                      </p>
                    )}
                    {health.usage && (
                      <p className="text-xs text-green-200">
                        {health.usage.toFixed(1)}%
                      </p>
                    )}
                    {health.latency && (
                      <p className="text-xs text-green-200">
                        {health.latency}ms
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className={`text-lg font-semibold ${healthStatus.overallHealth ? 'text-green-400' : 'text-red-400'}`}>
                  Overall Health: {healthStatus.overallHealth ? 'HEALTHY' : 'ISSUES DETECTED'}
                </p>
              </div>
            </div>
          )}

          {/* Test Results Summary */}
          {testResults && (
            <div className="bg-indigo-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-indigo-700 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-indigo-100">Test Results Summary</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-indigo-700 bg-opacity-50 rounded-lg p-4 border border-indigo-600">
                  <h3 className="text-lg font-semibold text-indigo-100">Total Routes</h3>
                  <p className="text-2xl font-bold text-indigo-100">{testResults.totalRoutes}</p>
                </div>
                
                <div className="bg-green-700 bg-opacity-50 rounded-lg p-4 border border-green-600">
                  <h3 className="text-lg font-semibold text-green-100">Passed</h3>
                  <p className="text-2xl font-bold text-green-100">{testResults.passedRoutes}</p>
                </div>
                
                <div className="bg-red-700 bg-opacity-50 rounded-lg p-4 border border-red-600">
                  <h3 className="text-lg font-semibold text-red-100">Failed</h3>
                  <p className="text-2xl font-bold text-red-100">{testResults.failedRoutes}</p>
                </div>
                
                <div className="bg-blue-700 bg-opacity-50 rounded-lg p-4 border border-blue-600">
                  <h3 className="text-lg font-semibold text-blue-100">Avg Response</h3>
                  <p className="text-2xl font-bold text-blue-100">{testResults.averageResponseTime.toFixed(2)}ms</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(testResults.categoryResults).map(([category, results]: [string, any]) => (
                  <div key={category} className="bg-indigo-700 bg-opacity-50 rounded-lg p-4 border border-indigo-600">
                    <h3 className="text-lg font-semibold text-indigo-100 capitalize">
                      {category.replace('-', ' ')}
                    </h3>
                    <p className="text-indigo-200">
                      {results.passed}/{results.total} passed
                    </p>
                    <p className="text-indigo-200">
                      Avg: {results.averageTime.toFixed(2)}ms
                    </p>
                    <button
                      onClick={() => getCategoryResults(category)}
                      className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Route List */}
          <div className="bg-purple-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-purple-700 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-purple-100">Route Tests</h2>
            
            <div className="space-y-4">
              {filteredRoutes.map((route: any, index: number) => (
                <div key={index} className="bg-purple-700 bg-opacity-50 rounded-lg p-4 border border-purple-600">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-purple-100">
                        {route.method} {route.path}
                      </h3>
                      <p className="text-purple-200 text-sm">{route.description}</p>
                      <p className="text-purple-300 text-xs">Category: {route.category}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`text-sm font-semibold ${getStatusColor(route.status)}`}>
                        {route.status.toUpperCase()}
                      </span>
                      
                      {route.responseTime && (
                        <span className="text-sm text-purple-200">
                          {route.responseTime}ms
                        </span>
                      )}
                      
                      <button
                        onClick={() => testSpecificRoute(route.path, route.method)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                  
                  {route.error && (
                    <div className="mt-2 text-red-400 text-sm">
                      Error: {route.error}
                    </div>
                  )}
                  
                  {route.lastTested && (
                    <div className="mt-2 text-purple-300 text-xs">
                      Last tested: {new Date(route.lastTested).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/creator/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
