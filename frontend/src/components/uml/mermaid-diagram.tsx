'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Define the props interface for the MermaidDiagram component
interface MermaidDiagramProps {
  chart: string;
  onElementClick?: (elementId: string) => void;
  className?: string;
}

// Mermaid diagram component for rendering UML diagrams
export function MermaidDiagram({ chart, onElementClick, className = '' }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chart) return;

    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose', // Needed for interactivity in development
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 14,
      curve: 'basis',
      gantt: {
        axisFormatter: [
          ['%Y-%m-%d', (d) => d.getDay() === 1],
          ['%d', (d) => d.getDate() !== 1],
          ['%H:%M', (d) => d.getHours()],
        ],
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
      },
      mindmap: {
        padding: 10,
        radius: 5,
      },
      journey: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        axisFormat: '%Y-%m-%d',
        personDimension: 15,
        arrowOffset: 5,
        bottomMarginAdj: 1,
        rightOffset: 30,
      },
    });

    const renderDiagram = async () => {
      try {
        // Clear previous error
        setError(null);
        
        // Generate a unique ID for this diagram
        const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Render the mermaid diagram
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        
        // Set the rendered SVG
        setSvg(renderedSvg);
        
      } catch (err) {
        console.error('Error rendering mermaid diagram:', err);
        setError('Failed to render diagram: ' + (err as Error).message);
      }
    };

    renderDiagram();
  }, [chart]);

  // Add click handlers to diagram elements after SVG is rendered
  useEffect(() => {
    if (!svg || !onElementClick || !containerRef.current) return;

    // Add click event listeners to all diagram elements
    const elements = containerRef.current.querySelectorAll('[id], [data-id], [class*="node"], [class*="actor"]');
    
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;

      // Try to get element ID from various attributes
      let elementId = target.id ||
                     target.getAttribute('data-id') ||
                     target.getAttribute('data-node-id') ||
                     target.parentElement?.id ||
                     target.parentElement?.getAttribute('data-id') ||
                     target.closest('[id]')?.id ||
                     target.closest('[data-id]')?.getAttribute('data-id');

      // If no ID found, try to extract from class names
      if (!elementId && target.className) {
        const classMatch = target.className.match(/(?:node|actor|participant|usecase)-(\w+)/);
        if (classMatch) {
          elementId = classMatch[1];
        }
      }

      if (elementId) {
        onElementClick(elementId);
      }
    };

    elements.forEach(el => {
      el.addEventListener('click', handleClick);
    });

    // Cleanup event listeners
    return () => {
      elements.forEach(el => {
        el.removeEventListener('click', handleClick);
      });
    };
  }, [svg, onElementClick]);

  if (error) {
    return (
      <div className={`p-4 text-center text-red-500 bg-red-50 rounded-lg ${className}`}>
        <p>Error rendering diagram:</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`${className}`}
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}