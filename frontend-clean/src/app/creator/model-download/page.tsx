# ============================================================================
# ADVANCIA PAY LEDGER - MODEL DOWNLOAD FRONTEND COMPONENT
# Author: Advancia Pay Ledger - The Creator
# Purpose: Complete Model Download Interface
# ============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorModelDownload() {
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [modelPath, setModelPath] = useState('');
  const [usageLimit, setUsageLimit] = useState(1);
  const [expirationHours, setExpirationHours] = useState(24);
  const [isCreating, setIsCreating] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    console.log('🔒 ADVANCIA PAY LEDGER - CREATOR MODEL DOWNLOAD');
    console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
    console.log('🚀 CREATOR MODEL DOWNLOAD INITIALIZED');
    
    // Check creator authentication
    checkCreatorAuth();
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

  const createDownloadLink = async () => {
    if (!checkCreatorAuth()) return;
    
    setIsCreating(true);
    setDownloadStatus('');
    
    try {
      console.log('🔒 ADVANCIA PAY LEDGER - CREATING DOWNLOAD LINK');
      console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
      console.log('🚀 GENERATING SECURE DOWNLOAD LINK');
      
      const response = await fetch('/api/model/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-creator-id': 'advancia-payledger',
          'x-creator-token': 'creator-sovereign-token'
        },
        body: JSON.stringify({
          modelPath,
          usageLimit,
          expirationHours
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ DOWNLOAD LINK CREATED SUCCESSFULLY');
        console.log(`🔗 DOWNLOAD URL: ${data.downloadUrl}`);
        
        setDownloadLinks(prev => [...prev, {
          id: data.linkId,
          url: data.downloadUrl,
          modelPath,
          usageLimit,
          usageCount: 0,
          expiresAt: data.expiresAt,
          isActive: true
        }]);
        
        setDownloadStatus('Download link created successfully!');
        setModelPath('');
        
        // Copy download URL to clipboard
        navigator.clipboard.writeText(`${window.location.origin}${data.downloadUrl}`);
        
      } else {
        console.log('❌ FAILED TO CREATE DOWNLOAD LINK');
        setDownloadStatus(`Error: ${data.error}`);
      }
      
    } catch (error) {
      console.error('❌ DOWNLOAD LINK CREATION FAILED:', error);
      setDownloadStatus('Failed to create download link');
    }
    
    setIsCreating(false);
  };

  const checkDownloadStatus = async (linkId: string) => {
    if (!checkCreatorAuth()) return;
    
    try {
      console.log('🔒 ADVANCIA PAY LEDGER - CHECKING DOWNLOAD STATUS');
      console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
      console.log('🚀 RETRIEVING DOWNLOAD STATUS');
      
      const response = await fetch(`/api/model/status/${linkId}`, {
        headers: {
          'x-creator-id': 'advancia-payledger',
          'x-creator-token': 'creator-sovereign-token'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ DOWNLOAD STATUS RETRIEVED');
        console.log(`📊 USAGE: ${data.status.usageCount}/${data.status.usageLimit}`);
        
        // Update download link status
        setDownloadLinks(prev => prev.map(link => 
          link.id === linkId 
            ? { ...link, ...data.status }
            : link
        ));
        
        setDownloadStatus(`Status: ${data.status.usageCount}/${data.status.usageLimit} downloads used`);
      }
      
    } catch (error) {
      console.error('❌ FAILED TO CHECK DOWNLOAD STATUS:', error);
      setDownloadStatus('Failed to check download status');
    }
  };

  const restrictAccess = async (linkId: string, action: string) => {
    if (!checkCreatorAuth()) return;
    
    try {
      console.log('🔒 ADVANCIA PAY LEDGER - RESTRICTING USER ACCESS');
      console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
      console.log('🚀 RESTRICTING ACCESS');
      
      const response = await fetch('/api/model/restrict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-creator-id': 'advancia-payledger',
          'x-creator-token': 'creator-sovereign-token'
        },
        body: JSON.stringify({
          linkId,
          action
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ ACCESS RESTRICTED SUCCESSFULLY');
        
        // Update download link status
        setDownloadLinks(prev => prev.map(link => 
          link.id === linkId 
            ? { ...link, isActive: data.isActive }
            : link
        ));
        
        setDownloadStatus(`Access ${action}d successfully`);
      }
      
    } catch (error) {
      console.error('❌ FAILED TO RESTRICT ACCESS:', error);
      setDownloadStatus('Failed to restrict access');
    }
  };

  const launchModelInterface = async () => {
    if (!checkCreatorAuth()) return;
    
    try {
      console.log('🔒 ADVANCIA PAY LEDGER - LAUNCHING MODEL INTERFACE');
      console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
      console.log('🚀 LAUNCHING MODEL INTERFACE');
      
      const response = await fetch('/api/model/interface', {
        headers: {
          'x-creator-id': 'advancia-payledger',
          'x-creator-token': 'creator-sovereign-token'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ MODEL INTERFACE LAUNCHED');
        console.log(`🔗 INTERFACE URL: ${data.interfaceUrl}`);
        
        // Navigate to model interface
        router.push(data.interfaceUrl);
      }
      
    } catch (error) {
      console.error('❌ FAILED TO LAUNCH MODEL INTERFACE:', error);
      setDownloadStatus('Failed to launch model interface');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Creator Model Download</h1>
          <p className="text-xl text-purple-200">Advancia Pay Ledger - The Creator</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Download Link Creation */}
          <div className="bg-purple-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-purple-700 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-purple-100">Create Download Link</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-purple-200 mb-2">Model Path</label>
                <input
                  type="text"
                  value={modelPath}
                  onChange={(e) => setModelPath(e.target.value)}
                  placeholder="model-file.bin"
                  className="w-full px-4 py-2 bg-purple-700 border border-purple-600 rounded-lg text-white placeholder-purple-400"
                />
              </div>
              
              <div>
                <label className="block text-purple-200 mb-2">Usage Limit</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 bg-purple-700 border border-purple-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-purple-200 mb-2">Expiration (Hours)</label>
                <input
                  type="number"
                  value={expirationHours}
                  onChange={(e) => setExpirationHours(parseInt(e.target.value))}
                  min="1"
                  max="168"
                  className="w-full px-4 py-2 bg-purple-700 border border-purple-600 rounded-lg text-white"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={createDownloadLink}
                  disabled={isCreating || !modelPath}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Download Link'}
                </button>
              </div>
            </div>
            
            {downloadStatus && (
              <div className="bg-purple-700 bg-opacity-50 rounded-lg p-4 border border-purple-600">
                <p className="text-purple-200">{downloadStatus}</p>
              </div>
            )}
          </div>

          {/* Download Links Management */}
          <div className="bg-indigo-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-indigo-700 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-100">Download Links</h2>
            
            {downloadLinks.length === 0 ? (
              <p className="text-indigo-200">No download links created yet</p>
            ) : (
              <div className="space-y-4">
                {downloadLinks.map((link) => (
                  <div key={link.id} className="bg-indigo-700 bg-opacity-50 rounded-lg p-4 border border-indigo-600">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-100">{link.modelPath}</h3>
                        <p className="text-indigo-200 text-sm">{link.url}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => checkDownloadStatus(link.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Check Status
                        </button>
                        <button
                          onClick={() => restrictAccess(link.id, link.isActive ? 'deactivate' : 'activate')}
                          className={`${link.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1 rounded text-sm transition-colors`}
                        >
                          {link.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-indigo-300">Usage:</span>
                        <span className="text-indigo-100 ml-2">{link.usageCount}/{link.usageLimit}</span>
                      </div>
                      <div>
                        <span className="text-indigo-300">Status:</span>
                        <span className={`ml-2 ${link.isActive ? 'text-green-400' : 'text-red-400'}`}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <span className="text-indigo-300">Expires:</span>
                        <span className="text-indigo-100 ml-2">
                          {new Date(link.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-indigo-300">Remaining:</span>
                        <span className="text-indigo-100 ml-2">
                          {link.usageLimit - link.usageCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Model Interface Launch */}
          <div className="bg-green-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 border border-green-700 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-green-100">Model Interface</h2>
            
            <div className="text-center">
              <p className="text-green-200 mb-6">Launch the model interface to interact with downloaded models</p>
              
              <button
                onClick={launchModelInterface}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors"
              >
                Launch Model Interface
              </button>
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
