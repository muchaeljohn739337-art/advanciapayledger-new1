export type ThreatLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RiskScore = ThreatLevel;

export interface AIInsightAction {
  id: string;
  label: string;
  route?: string;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  type: "predictive" | "diagnostic" | "prescriptive" | "descriptive";
  category: string;
  confidence: number;
  actionable?: boolean;
  actions?: AIInsightAction[];
}

export interface SmartRecommendation {
  id: string;
  title?: string;
  description?: string;
  priority: number;
  relevanceScore: number;
  type: string;
  quickAction?: {
    route?: string;
  };
}

export interface AnomalyDetection {
  isAnomaly: boolean;
  anomalyType: string;
  description: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  suggestedActions: string[];
}

export interface SessionRiskAnalysis {
  threatLevel: ThreatLevel;
  riskScore: number;
  factors: Record<string, boolean>;
  recommendations: string[];
}

export interface LoginRiskAssessment {
  riskScore: number;
  threatLevel: ThreatLevel;
  recommendations: string[];
}

export interface PredictiveAnalysis {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  currentValue?: number;
  predictedValue?: number;
  trend?: "up" | "down" | "stable";
}

export interface SmartDateRange {
  start: string;
  end: string;
  reason?: string;
}

export interface UIPersonalization {
  preferences: Record<string, unknown>;
}

export interface ComplianceAlert {
  id: string;
  severity: string;
  message: string;
}

export interface FraudDetection {
  flagged: boolean;
  score: number;
  reasons: string[];
}

export interface GeographyInsight {
  region: string;
  value: number;
}

export interface RevenueForecast {
  forecast: number[];
  confidence: number;
  scenarios?: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  factors?: {
    seasonality: number;
    trend: number;
    external: number;
  };
}

export interface AutoCompleteContext {
  suggestions: string[];
}

export interface FormAssistance {
  field: string;
  suggestion: string;
}

export interface AIAnalysisRequest {
  type: string;
  payload?: Record<string, unknown>;
}

export interface AIAnalysisResponse<T = unknown> {
  success: boolean;
  data: T;
}