// AI Analysis Types
export interface RiskAssessment {
  riskAreas: RiskArea[];
  overallRiskScore: number; // 0-100 scale
  riskSummary: string;
}

export interface RiskArea {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendations: string[];
  sourceLocation: {
    startIndex: number;
    endIndex: number;
    sentence: string;
  };
}

export interface ComplexityAssessment {
  complexityFactors: ComplexityFactor[];
  totalComplexityScore: number; // 0-100 scale
  complexityCategory: 'simple' | 'moderate' | 'complex' | 'very-complex';
  improvementSuggestions: string[];
  estimatedEffort: {
    developmentHours: number;
    maintenanceHours: number;
  };
}

export interface ComplexityFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  score: number; // 0-10 scale
  description: string;
  confidence: number;
}

export interface AiAnalysisResponse {
  riskAssessment?: RiskAssessment;
  complexityAssessment?: ComplexityAssessment;
}