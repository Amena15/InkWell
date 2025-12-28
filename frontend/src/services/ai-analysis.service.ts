import type { 
  RiskAssessment, 
  ComplexityAssessment, 
  AiAnalysisResponse 
} from '@/types/ai-analysis';
import apiClient from '@/lib/api-client';

/**
 * AI Analysis Service
 *
 * This service handles all AI-powered analysis operations including:
 * - Risk assessment of documents
 * - Complexity analysis and estimation
 * - Predictive maintenance insights
 * - Recommendations for improvements
 *
 * All methods return Promises and handle proper error propagation
 * Uses API routes to communicate with backend AI services
 */
export const aiAnalysisService = {
  /**
   * Analyze document text for risk areas and complexity factors
   * @param text - The document content to analyze
   * @param analysisType - Type of analysis to perform ('risk', 'complexity', or 'both')
   * @returns Analysis results with risk and/or complexity data
   */
  async analyzeText(
    text: string,
    analysisType: 'risk' | 'complexity' | 'both' = 'both'
  ): Promise<AiAnalysisResponse> {
    try {
      const response = await apiClient.post<AiAnalysisResponse>('/api/ai/analyze', {
        text,
        analysisType
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to analyze text:', error);
      throw error;
    }
  },

  /**
   * Get risk assessment for a specific document
   * @param text - Document content to assess for risks
   * @returns Risk assessment data
   */
  async getRiskAssessment(text: string): Promise<RiskAssessment> {
    try {
      const response = await apiClient.post<AiAnalysisResponse>('/api/ai/analyze', {
        text,
        analysisType: 'risk'
      });
      
      if (!response.data.riskAssessment) {
        throw new Error('No risk assessment returned from API');
      }
      
      return response.data.riskAssessment;
    } catch (error) {
      console.error('Failed to get risk assessment:', error);
      throw error;
    }
  },

  /**
   * Get complexity assessment for a specific document
   * @param text - Document content to assess for complexity
   * @returns Complexity assessment data
   */
  async getComplexityAssessment(text: string): Promise<ComplexityAssessment> {
    try {
      const response = await apiClient.post<AiAnalysisResponse>('/api/ai/analyze', {
        text,
        analysisType: 'complexity'
      });
      
      if (!response.data.complexityAssessment) {
        throw new Error('No complexity assessment returned from API');
      }
      
      return response.data.complexityAssessment;
    } catch (error) {
      console.error('Failed to get complexity assessment:', error);
      throw error;
    }
  },

  /**
   * Get risk assessment for a specific document by ID
   * @param documentId - ID of the document to analyze
   * @returns Risk assessment data
   */
  async getDocumentRiskAssessment(documentId: string): Promise<RiskAssessment> {
    try {
      const response = await apiClient.get(`/api/documents/${documentId}`);
      const documentContent = response.data.content;
      
      return await this.getRiskAssessment(documentContent);
    } catch (error) {
      console.error(`Failed to get risk assessment for document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Get complexity assessment for a specific document by ID
   * @param documentId - ID of the document to analyze
   * @returns Complexity assessment data
   */
  async getDocumentComplexityAssessment(documentId: string): Promise<ComplexityAssessment> {
    try {
      const response = await apiClient.get(`/api/documents/${documentId}`);
      const documentContent = response.data.content;
      
      return await this.getComplexityAssessment(documentContent);
    } catch (error) {
      console.error(`Failed to get complexity assessment for document ${documentId}:`, error);
      throw error;
    }
  }
};

export default aiAnalysisService;