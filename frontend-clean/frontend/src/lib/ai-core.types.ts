// AI Core Types for Advancia PayLedger
export interface ThreatLevel {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  timestamp: Date;
}

export interface AIThreat {
  id: string;
  type: string;
  severity: ThreatLevel;
  description: string;
  source: string;
  detectedAt: Date;
  status: 'ACTIVE' | 'RESOLVED' | 'MONITORING';
}

export interface AISecurityMetrics {
  totalThreats: number;
  activeThreats: number;
  blockedAttempts: number;
  securityScore: number;
  lastScan: Date;
}

export interface AIResponse {
  action: string;
  confidence: number;
  recommendation: string;
  executed: boolean;
}

export interface AnomalyDetection {
  id: string;
  type: string;
  severity: ThreatLevel;
  description: string;
  detectedAt: Date;
  resolved: boolean;
}

export interface LoginRiskAssessment {
  riskScore: number;
  riskFactors: string[];
  recommendation: string;
  allowLogin: boolean;
}

export interface SessionRiskAnalysis {
  sessionId: string;
  riskScore: number;
  anomalies: AnomalyDetection[];
  lastActivity: Date;
  trustLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}
