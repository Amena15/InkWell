export interface MetricsData {
  documentId: string;
  coveragePercent: number;
  consistencyScore: number;
  lastUpdated: Date;
  totalChecks: number;
  passingChecks: number;
}

export interface IMetricsService {
  updateMetrics(data: Omit<MetricsData, 'lastUpdated' | 'totalChecks' | 'passingChecks'> & { 
    isConsistent?: boolean;
  }): Promise<MetricsData>;
  getMetrics(documentId: string): Promise<MetricsData | null>;
  resetMetrics(documentId: string): Promise<void>;
  handleConsistencyEvent(event: { documentId: string; isConsistent: boolean }): Promise<void>;
}
