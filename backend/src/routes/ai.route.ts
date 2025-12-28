import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Define request and response schemas
const aiAnalysisRequest = z.object({
  text: z.string().min(1, 'Text is required'),
  analysisType: z.enum(['risk', 'complexity', 'both'], {
    errorMap: () => ({ message: 'Analysis type must be "risk", "complexity", or "both"' })
  })
});

type AiAnalysisRequest = z.infer<typeof aiAnalysisRequest>;

interface RiskAssessment {
  riskAreas: Array<{
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
  }>;
  overallRiskScore: number; // 0-100 scale
  riskSummary: string;
}

interface ComplexityAssessment {
  complexityFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high';
    score: number; // 0-10 scale
    description: string;
    confidence: number;
  }>;
  totalComplexityScore: number; // 0-100 scale
  complexityCategory: 'simple' | 'moderate' | 'complex' | 'very-complex';
  improvementSuggestions: string[];
  estimatedEffort: {
    developmentHours: number;
    maintenanceHours: number;
  };
}

interface AiAnalysisResponse {
  riskAssessment?: RiskAssessment;
  complexityAssessment?: ComplexityAssessment;
}

export async function aiRoutes(server: FastifyInstance) {
  server.post<{ Body: AiAnalysisRequest; Reply: AiAnalysisResponse }>('/api/ai/analyze', async (request: FastifyRequest<{ Body: AiAnalysisRequest }>, reply: FastifyReply) => {
    try {
      // Validate request
      const validationResult = aiAnalysisRequest.safeParse(request.body);
      if (!validationResult.success) {
        return reply.status(400).send({
          error: validationResult.error.errors.map(e => e.message).join(', ')
        });
      }

      const { text, analysisType } = validationResult.data;

      const response: AiAnalysisResponse = {};

      if (analysisType === 'risk' || analysisType === 'both') {
        response.riskAssessment = analyzeTextForRisk(text);
      }

      if (analysisType === 'complexity' || analysisType === 'both') {
        response.complexityAssessment = analyzeTextForComplexity(text);
      }

      return response;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to analyze text' });
    }
  });
}

// Function to analyze text for risk areas
function analyzeTextForRisk(text: string): RiskAssessment {
  const riskAreas: RiskAssessment['riskAreas'] = [];
  const lowerText = text.toLowerCase();
  
  // Define risk patterns and keywords
  const riskPatterns = [
    {
      id: 'conflicting-requirements',
      title: 'Conflicting Requirements',
      pattern: /\b(conflict|contradict|opposite|different|disagree|inconsistent)\b/gi,
      severity: 'high' as const
    },
    {
      id: 'ambiguous-terms',
      title: 'Ambiguous Terms',
      pattern: /\b(maybe|perhaps|possibly|sometimes|if possible|unclear|vague|undefined|not specified)\b/gi,
      severity: 'medium' as const
    },
    {
      id: 'missing-requirements',
      title: 'Missing Requirements',
      pattern: /\b(not implemented|not defined|not specified|to be determined|tbd|future|not clear|not mentioned)\b/gi,
      severity: 'medium' as const
    },
    {
      id: 'performance-concerns',
      title: 'Performance Concerns',
      pattern: /\b(performance|bottleneck|slow|scalability|capacity|limited|constraint|restriction)\b/gi,
      severity: 'medium' as const
    },
    {
      id: 'security-issues',
      title: 'Security Vulnerabilities',
      pattern: /\b(security|vulnerability|exposed|unprotected|unauthorized|privilege escalation|attack)\b/gi,
      severity: 'critical' as const
    },
    {
      id: 'error-handling',
      title: 'Error Handling Needs',
      pattern: /\b(error|exception|failure|crash|fault|exception handling|error handling)\b/gi,
      severity: 'medium' as const
    }
  ];

  // Find risk patterns in text
  riskPatterns.forEach(patternObj => {
    let match;
    while ((match = patternObj.pattern.exec(lowerText)) !== null) {
      // Get the surrounding context for the match
      const start = Math.max(0, match.index - 50);
      const end = Math.min(text.length, match.index + match[0].length + 50);
      const sentence = text.substring(start, end);
      
      riskAreas.push({
        id: patternObj.id,
        title: patternObj.title,
        description: `Potential ${patternObj.title.toLowerCase()} detected in text`,
        severity: patternObj.severity,
        confidence: Math.min(0.7 + Math.random() * 0.3, 1.0), // Random confidence between 0.7-1.0
        recommendations: [
          'Clarify the requirement',
          'Provide more specific definitions',
          'Add constraints or conditions'
        ],
        sourceLocation: {
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          sentence: sentence
        }
      });
    }
  });

  // Calculate overall risk score based on findings
  let riskScore = 0;
  riskAreas.forEach(area => {
    switch (area.severity) {
      case 'critical': riskScore += 25; break;
      case 'high': riskScore += 15; break;
      case 'medium': riskScore += 8; break;
      case 'low': riskScore += 3; break;
    }
  });
  
  // Cap the score at 100
  riskScore = Math.min(riskScore, 100);

  // Generate risk summary
  const riskSummary = riskAreas.length > 0 
    ? `Found ${riskAreas.length} potential risk areas. Focus on ${riskAreas.slice(0, 2).map(area => area.title.toLowerCase()).join(', ')} first.`
    : 'No significant risk areas detected in the current text.';

  return {
    riskAreas,
    overallRiskScore: riskScore,
    riskSummary
  };
}

// Function to analyze text for complexity factors
function analyzeTextForComplexity(text: string): ComplexityAssessment {
  const complexityFactors: ComplexityAssessment['complexityFactors'] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  
  // Evaluate different complexity factors
  const factorEvaluations = [
    {
      factor: 'Functional Complexity',
      impact: 'high' as const,
      score: calculateFunctionalComplexity(text),
      description: 'Based on number of functions, processes, and interactions described',
      confidence: 0.8
    },
    {
      factor: 'Data Dependencies',
      impact: 'high' as const,
      score: calculateDataComplexity(text),
      description: 'Based on interconnected data flows and dependencies',
      confidence: 0.75
    },
    {
      factor: 'User Path Variations',
      impact: 'medium' as const,
      score: calculatePathVariations(text),
      description: 'Based on conditional paths, if-then scenarios, and variations',
      confidence: 0.7
    },
    {
      factor: 'Integration Points',
      impact: 'high' as const,
      score: calculateIntegrations(text),
      description: 'Based on external system integrations and APIs',
      confidence: 0.85
    }
  ];

  factorEvaluations.forEach(factor => {
    complexityFactors.push({
      factor: factor.factor,
      impact: factor.impact,
      score: factor.score,
      description: factor.description,
      confidence: factor.confidence
    });
  });

  // Calculate total complexity score (average of all factors with weights)
  const weightedScore = complexityFactors.reduce((sum, factor) => {
    let weight = 1;
    if (factor.impact === 'high') weight = 1.2;
    if (factor.impact === 'medium') weight = 1.0;
    if (factor.impact === 'low') weight = 0.8;
    
    return sum + (factor.score * weight);
  }, 0) / complexityFactors.length;

  // Determine complexity category based on score
  let complexityCategory: ComplexityAssessment['complexityCategory'] = 'simple';
  if (weightedScore >= 8) complexityCategory = 'very-complex';
  else if (weightedScore >= 6) complexityCategory = 'complex';
  else if (weightedScore >= 4) complexityCategory = 'moderate';

  // Generate improvement suggestions
  const improvementSuggestions = [
    'Consider breaking complex components into smaller modules',
    'Add more detailed specifications for ambiguous requirements',
    'Implement proper error handling and logging mechanisms'
  ];

  // Estimate effort based on complexity
  const estimatedEffort = {
    developmentHours: Math.round(weightedScore * 15 + 10),
    maintenanceHours: Math.round(weightedScore * 8 + 5)
  };

  return {
    complexityFactors,
    totalComplexityScore: Math.round(weightedScore * 10), // Scale to 0-100
    complexityCategory,
    improvementSuggestions,
    estimatedEffort
  };
}

// Calculate functional complexity based on number of verbs/processes
function calculateFunctionalComplexity(text: string): number {
  const verbPatterns = [
    /\b(create|generate|delete|update|modify|process|handle|manage|control|execute|perform|implement|configure|deploy|monitor)\b/gi
  ];
  
  let count = 0;
  verbPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  });
  
  // Convert to complexity score (0-10)
  return Math.min(count * 1.5, 10);
}

// Calculate data complexity based on references to data
function calculateDataComplexity(text: string): number {
  const dataPatterns = [
    /\b(data|database|storage|table|record|field|attribute|entity|model|schema|relationship|connection)\b/gi
  ];
  
  let count = 0;
  dataPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  });
  
  // Convert to complexity score (0-10)
  return Math.min(count * 0.8, 10);
}

// Calculate path variations based on conditional language
function calculatePathVariations(text: string): number {
  const conditionalPatterns = [
    /\b(if|when|unless|otherwise|alternatively|exception|condition|requirement|case)\b/gi
  ];
  
  let count = 0;
  conditionalPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  });
  
  // Convert to complexity score (0-10)
  return Math.min(count * 0.6, 10);
}

// Calculate integration points based on external references
function calculateIntegrations(text: string): number {
  const integrationPatterns = [
    /\b(API|interface|external|third-party|service|endpoint|system|library|framework|connector|platform|provider)\b/gi
  ];
  
  let count = 0;
  integrationPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  });
  
  // Convert to complexity score (0-10)
  return Math.min(count * 1.2, 10);
}