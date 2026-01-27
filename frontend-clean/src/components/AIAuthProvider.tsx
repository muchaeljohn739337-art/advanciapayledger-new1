"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AISecurityContext {
  riskScore: number;
  threats: string[];
  recommendations: string[];
  biometricVerified: boolean;
  voiceVerified: boolean;
  faceVerified: boolean;
  securityLevel: 'SECURE' | 'MEDIUM_RISK' | 'HIGH_RISK';
  isLoading: boolean;
  updateSecurityStatus: (data: any) => void;
}

const AISecurityContext = createContext<AISecurityContext | undefined>(undefined);

export function AIAuthProvider({ children }: { children: React.ReactNode }) {
  const [riskScore, setRiskScore] = useState(0);
  const [threats, setThreats] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [voiceVerified, setVoiceVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'SECURE' | 'MEDIUM_RISK' | 'HIGH_RISK'>('SECURE');
  const [isLoading, setIsLoading] = useState(false);

  const updateSecurityStatus = (data: any) => {
    setRiskScore(data.riskScore || 0);
    setThreats(data.threats || []);
    setRecommendations(data.recommendations || []);
    setBiometricVerified(data.biometricVerified || false);
    setVoiceVerified(data.voiceVerified || false);
    setFaceVerified(data.faceVerified || false);
    
    // Update security level based on risk score
    if (data.riskScore > 50) {
      setSecurityLevel('HIGH_RISK');
    } else if (data.riskScore > 25) {
      setSecurityLevel('MEDIUM_RISK');
    } else {
      setSecurityLevel('SECURE');
    }
  };

  // AI Security monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate AI security monitoring
      console.log('AI Security: Monitoring system status...');
      console.log('AI Security: Scanning for anomalies...');
      console.log('AI Security: Updating threat intelligence...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AISecurityContext.Provider
      value={{
        riskScore,
        threats,
        recommendations,
        biometricVerified,
        voiceVerified,
        faceVerified,
        securityLevel,
        isLoading,
        updateSecurityStatus,
      }}
    >
      {children}
    </AISecurityContext.Provider>
  );
}

export function useAISecurity() {
  const context = useContext(AISecurityContext);
  if (context === undefined) {
    throw new Error('useAISecurity must be used within an AIAuthProvider');
  }
  return context;
}
