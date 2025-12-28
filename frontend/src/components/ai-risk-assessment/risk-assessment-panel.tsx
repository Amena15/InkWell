'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  FileText,
  Brain,
  TrendingUp,
  Lightbulb,
  Shield,
  Clock,
  Wrench
} from 'lucide-react';
import aiAnalysisService from '@/services/ai-analysis.service';
import { RiskAssessment, ComplexityAssessment } from '@/types/ai-analysis';
import { Skeleton } from '@/components/ui/skeleton';

interface RiskAssessmentPanelProps {
  documentText: string;
  onRiskIdentified?: (count: number) => void;
}

export function RiskAssessmentPanel({ documentText, onRiskIdentified }: RiskAssessmentPanelProps) {
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [complexityAssessment, setComplexityAssessment] = useState<ComplexityAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeDocument();
  }, [documentText]);

  const analyzeDocument = async () => {
    if (!documentText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await aiAnalysisService.analyzeText(documentText, 'both');

      if (results.riskAssessment) {
        setRiskAssessment(results.riskAssessment);
        onRiskIdentified?.(results.riskAssessment.riskAreas.length);
      }

      if (results.complexityAssessment) {
        setComplexityAssessment(results.complexityAssessment);
      }
    } catch (err: any) {
      console.error('Error analyzing document:', err);
      setError(err.message || 'Failed to analyze document for risks and complexity');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Risk & Complexity Assessment
          </CardTitle>
          <CardDescription>
            Analyzing your document for potential risks and complexity factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button
            className="mt-4"
            onClick={analyzeDocument}
          >
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-orange-200 dark:border-orange-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle>Risk & Complexity Assessment</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {riskAssessment && (
              <Badge
                variant={riskAssessment.overallRiskScore > 70 ? 'destructive' : riskAssessment.overallRiskScore > 40 ? 'default' : 'secondary'}
              >
                Risk: {riskAssessment.overallRiskScore}/100
              </Badge>
            )}
            {complexityAssessment && (
              <Badge
                variant={complexityAssessment.totalComplexityScore > 70 ? 'destructive' : complexityAssessment.totalComplexityScore > 40 ? 'default' : 'secondary'}
              >
                Complexity: {complexityAssessment.totalComplexityScore}/100
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          AI-powered analysis of your document's risk areas and complexity factors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="risk" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="risk">Risk Areas</TabsTrigger>
            <TabsTrigger value="complexity">Complexity Factors</TabsTrigger>
          </TabsList>

          <TabsContent value="risk" className="mt-4">
            {riskAssessment && (
              <div className="space-y-4">
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Overall Risk Score</span>
                    <span className="text-sm font-medium">{riskAssessment.overallRiskScore}/100</span>
                  </div>
                  <Progress value={riskAssessment.overallRiskScore} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{riskAssessment.riskSummary}</p>
                </div>

                {riskAssessment.riskAreas.length > 0 ? (
                  <div className="space-y-4">
                    {riskAssessment.riskAreas.map((risk) => (
                      <Card
                        key={risk.id}
                        className={`border-l-4 ${
                          risk.severity === 'critical' ? 'border-l-red-500' :
                          risk.severity === 'high' ? 'border-l-orange-500' :
                          risk.severity === 'medium' ? 'border-l-yellow-500' :
                          'border-l-blue-500'
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {risk.severity === 'critical' ? <Shield className="h-4 w-4 text-red-500" /> :
                               risk.severity === 'high' ? <AlertTriangle className="h-4 w-4 text-orange-500" /> :
                               risk.severity === 'medium' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                               <Lightbulb className="h-4 w-4 text-blue-500" />}
                              {risk.title}
                            </CardTitle>
                            <div className="flex gap-2">
                              <Badge
                                variant={
                                  risk.severity === 'critical' ? 'destructive' :
                                  risk.severity === 'high' ? 'destructive' :
                                  risk.severity === 'medium' ? 'default' :
                                  'secondary'
                                }
                              >
                                {risk.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {Math.round(risk.confidence * 100)}% confidence
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-3">{risk.description}</p>
                          <div className="text-xs text-muted-foreground mb-3">
                            <strong>Source:</strong> "{risk.sourceLocation.sentence}"
                          </div>
                          <div>
                            <strong>Recommendations:</strong>
                            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                              {risk.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No risk areas identified in the current text.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Your document appears to be clear and well-defined with minimal risk factors.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="complexity" className="mt-4">
            {complexityAssessment && (
              <div className="space-y-4">
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Total Complexity Score</span>
                    <span className="text-sm font-medium">{complexityAssessment.totalComplexityScore}/100</span>
                  </div>
                  <Progress value={complexityAssessment.totalComplexityScore} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Complexity Category: <span className="capitalize">{complexityAssessment.complexityCategory}</span>
                  </p>
                </div>

                <div className="grid gap-4">
                  {complexityAssessment.complexityFactors.map((factor, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{factor.factor}</h4>
                            <p className="text-sm text-muted-foreground">{factor.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">{factor.score}/10</span>
                              <Badge
                                variant={
                                  factor.impact === 'high' ? 'destructive' :
                                  factor.impact === 'medium' ? 'default' :
                                  'secondary'
                                }
                              >
                                {factor.impact.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Confidence: {Math.round(factor.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Improvement Suggestions
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {complexityAssessment.improvementSuggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm">{suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimated Effort
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 text-center">
                      <TrendingUp className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                      <div className="text-2xl font-bold">{complexityAssessment.estimatedEffort.developmentHours}h</div>
                      <div className="text-sm text-muted-foreground">Development</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <Brain className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                      <div className="text-2xl font-bold">{complexityAssessment.estimatedEffort.maintenanceHours}h</div>
                      <div className="text-sm text-muted-foreground">Maintenance</div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}