'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  FileText, 
  GitBranch, 
  Database, 
  Eye, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { MermaidDiagram } from './mermaid-diagram';

interface TraceabilityMap {
  [elementId: string]: {
    sourceText: string;
    startIndex: number;
    endIndex: number;
    confidence: number;
  };
}

interface UmlGeneratorProps {
  initialText?: string;
}

export function UmlGenerator({ initialText = '' }: UmlGeneratorProps) {
  const [documentText, setDocumentText] = useState(initialText);
  const [diagramType, setDiagramType] = useState<'usecase' | 'sequence' | 'dataflow'>('usecase');
  const [generatedDiagram, setGeneratedDiagram] = useState<string>('');
  const [traceabilityMap, setTraceabilityMap] = useState<TraceabilityMap>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const generateDiagram = async () => {
    if (!documentText.trim()) {
      toast.error('Please enter some text to generate a diagram');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/uml/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: documentText,
          type: diagramType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate diagram');
      }

      const result = await response.json();
      setGeneratedDiagram(result.diagram);
      setTraceabilityMap(result.traceabilityMap);

      toast.success('Diagram generated successfully!');
    } catch (error: any) {
      console.error('Error generating diagram:', error);
      toast.error(error.message || 'Failed to generate diagram. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Get selected element data for display
  const selectedElementData = selectedElement ? traceabilityMap[selectedElement] : null;

  // Handle element click in the diagram
  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
  };

  useEffect(() => {
    // If there's initial text provided, set it in the state
    if (initialText) {
      setDocumentText(initialText);
    }
  }, [initialText]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input section */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Text
            </CardTitle>
            <CardDescription>
              Enter your document text to generate UML diagrams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentText">Document Content</Label>
                <Textarea
                  id="documentText"
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Enter your document content here..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Diagram Type</Label>
                <Tabs
                  value={diagramType}
                  onValueChange={(value: 'usecase' | 'sequence' | 'dataflow') => setDiagramType(value)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="usecase" className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Use Case
                    </TabsTrigger>
                    <TabsTrigger value="sequence" className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Sequence
                    </TabsTrigger>
                    <TabsTrigger value="dataflow" className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Data Flow
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Button
                onClick={generateDiagram}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Generate Diagram
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Diagram output section */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Generated Diagram
            </CardTitle>
            <CardDescription>
              Visual representation of your document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-auto">
              {generatedDiagram ? (
                <MermaidDiagram
                  chart={generatedDiagram}
                  onElementClick={handleElementClick}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                  <Info className="h-12 w-12 mb-4 opacity-50" />
                  <p>Generate a diagram to preview it here</p>
                  <p className="text-sm mt-2">Enter text and select diagram type</p>
                </div>
              )}
            </div>

            {Object.keys(traceabilityMap).length > 0 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{Object.keys(traceabilityMap).length} elements traced</span>
                </div>
                {selectedElement && (
                  <Badge variant="secondary">
                    Selected: {selectedElement}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Element details and traceability section */}
      {selectedElementData && (
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Element Traceability
            </CardTitle>
            <CardDescription>
              Source text for the selected diagram element
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Source Text</h4>
                  <Badge variant="outline">
                    Confidence: {Math.round(selectedElementData.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedElementData.sourceText}
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Text range: {selectedElementData.startIndex}-{selectedElementData.endIndex}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available elements overview */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Diagram Elements</CardTitle>
          <CardDescription>
            Click on elements in the diagram to see their source text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(traceabilityMap).map(([elementId, data]) => {
              const isSelected = elementId === selectedElement;
              return (
                <Card
                  key={elementId}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => setSelectedElement(elementId)}
                >
                  <CardContent className="p-4">
                    <div className="font-medium mb-1">{elementId}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {data.sourceText.substring(0, 40)}...
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.round(data.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {Object.keys(traceabilityMap).length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No elements generated yet. Generate a diagram to see available elements.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}