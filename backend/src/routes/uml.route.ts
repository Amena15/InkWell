import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Define the request schema for UML generation
const umlRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  type: z.enum(['usecase', 'sequence', 'dataflow'], {
    errorMap: () => ({ message: 'Diagram type must be "usecase", "sequence", or "dataflow"' })
  })
});

type UmlRequest = {
  text: string;
  type: 'usecase' | 'sequence' | 'dataflow';
};

interface SourceTextInfo {
  sourceText: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

interface UmlResponse {
  diagram: string; // Mermaid or PlantUML format string
  traceabilityMap: {
    [elementId: string]: SourceTextInfo;
  };
}

export async function umlRoutes(server: FastifyInstance) {
  server.post<{ Body: UmlRequest; Reply: UmlResponse }>('/api/uml/generate', async (request: FastifyRequest<{ Body: UmlRequest }>, reply: FastifyReply) => {
    try {
      // Validate the request
      const validationResult = umlRequestSchema.safeParse(request.body);
      if (!validationResult.success) {
        return reply.status(400).send({
          error: validationResult.error.errors.map(e => e.message).join(', ')
        });
      }

      const { text, type } = validationResult.data;

      // Generate the diagram based on the requested type
      let diagram: string;
      switch (type) {
        case 'usecase':
          diagram = generateUseCaseDiagram(text);
          break;
        case 'sequence':
          diagram = generateSequenceDiagram(text);
          break;
        case 'dataflow':
          diagram = generateDataFlowDiagram(text);
          break;
        default:
          diagram = generateUseCaseDiagram(text); // Default to use case
      }

      // Extract traceability information from the text
      const traceabilityMap = generateTraceabilityMap(text, diagram);

      return reply.send({
        diagram,
        traceabilityMap
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to generate UML diagram' });
    }
  });

  server.post<{ Body: { diagram: string; elementId: string }; Reply: string }>('/api/uml/trace-element', async (request: FastifyRequest<{ Body: { diagram: string; elementId: string } }>, reply: FastifyReply) => {
    try {
      const { diagram, elementId } = request.body;

      // Find the source text for the specified element ID
      // In a real implementation, this would use the traceability map
      // For now, we'll return a sample mapping
      return reply.send(findSourceText(diagram, elementId));
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to trace element to source text' });
    }
  });
}

// Generate a use case diagram from text
function generateUseCaseDiagram(text: string): string {
  // This is a simplified implementation
  // In a real application, you would use NLP to extract actors and use cases
  
  // Sample parsing for demonstration
  const actors = extractActors(text);
  const useCases = extractUseCases(text);
  const relationships = extractRelationships(text, actors, useCases);
  
  let diagram = 'graph TD;\n';
  
  // Define actors
  actors.forEach((actor, index) => {
    diagram += `  A${index}("${actor}")\n`;
  });
  
  // Define use cases
  useCases.forEach((useCase, index) => {
    diagram += `  UC${index}(${useCase})\n`;
  });
  
  // Define relationships
  relationships.forEach(rel => {
    diagram += `  A${rel.actorIndex} --> UC${rel.useCaseIndex}\n`;
  });
  
  return diagram;
}

// Generate a sequence diagram from text
function generateSequenceDiagram(text: string): string {
  // Simplified implementation
  const participants = extractParticipants(text);
  const messages = extractMessages(text);
  
  let diagram = 'sequenceDiagram\n';
  
  // Define participants
  participants.forEach(participant => {
    diagram += `  participant ${participant}\n`;
  });
  
  // Define messages
  messages.forEach(message => {
    diagram += `  ${message.from} ->>+ ${message.to}: ${message.content}\n`;
    diagram += `  ${message.to} ->>- ${message.from}: OK\n`;
  });
  
  return diagram;
}

// Generate a data flow diagram from text
function generateDataFlowDiagram(text: string): string {
  // Simplified implementation
  const entities = extractEntities(text);
  const processes = extractProcesses(text);
  const dataStores = extractDataStores(text);
  const dataFlows = extractDataFlows(text, entities, processes, dataStores);
  
  let diagram = 'graph LR;\n';
  
  // Define entities
  entities.forEach((entity, index) => {
    diagram += `  E${index}[${entity}]\n`;
  });
  
  // Define processes
  processes.forEach((process, index) => {
    diagram += `  P${index}(${process})\n`;
  });
  
  // Define data stores
  dataStores.forEach((store, index) => {
    diagram += `  DS${index}[${store}]\n`;
  });
  
  // Define data flows
  dataFlows.forEach(flow => {
    diagram += `  ${flow.source} --> ${flow.target}\n`;
  });
  
  return diagram;
}

// Extract actors from text using simple patterns
function extractActors(text: string): string[] {
  // Look for common actor patterns
  const patterns = [
    /\bactor\s+(\w+(?:\s+\w+)*)\b/gi,
    /\buser\s+(\w+(?:\s+\w+)*)\b/gi,
    /\brole\s+(\w+(?:\s+\w+)*)\b/gi,
    /\bsystem\s+(\w+)/gi,
  ];
  
  const matches: string[] = [];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const extracted = match[1].trim();
      if (extracted && !matches.includes(extracted)) {
        matches.push(extracted);
      }
    }
  });
  
  // Add common actors if not already found
  const commonActors = ['User', 'Administrator', 'System', 'Customer', 'Guest'].filter(
    actor => !matches.includes(actor)
  );
  
  return [...matches, ...commonActors].slice(0, 10); // Limit to 10 actors
}

// Extract use cases from text
function extractUseCases(text: string): string[] {
  const patterns = [
    /\bcan\s+(?:create|read|update|delete|view|edit|manage)\s+(\w+(?:\s+\w+)*)/gi,
    /\bto\s+(?:create|read|update|delete|view|edit|manage)\s+(\w+(?:\s+\w+)*)(?:\s+by)?/gi,
    /(?:user|administrator)\s+(?:can|should|will)\s+(?:create|read|update|delete|view|edit|manage|access|modify|perform)\s+(\w+(?:\s+\w+)*)(?:\s+of)?/gi,
  ];
  
  const matches: string[] = [];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const extracted = match[1].trim();
      if (extracted && !matches.includes(extracted)) {
        matches.push(extracted);
      }
    }
  });
  
  return matches.slice(0, 15); // Limit to 15 use cases
}

// Extract relationships between actors and use cases
function extractRelationships(text: string, actors: string[], useCases: string[]): { actorIndex: number; useCaseIndex: number }[] {
  const relationships: { actorIndex: number; useCaseIndex: number }[] = [];
  
  actors.forEach((actor, actorIndex) => {
    useCases.forEach((useCase, useCaseIndex) => {
      // If both actor and useCase appear in the text, assume a relationship
      if (text.toLowerCase().includes(actor.toLowerCase()) && text.toLowerCase().includes(useCase.toLowerCase())) {
        relationships.push({ actorIndex, useCaseIndex });
      }
    });
  });
  
  return relationships;
}

// Extract participants from text for sequence diagrams
function extractParticipants(text: string): string[] {
  const actors = extractActors(text);
  const extractedParticipants = [
    ...actors,
    'Database',
    'API',
    'ExternalService',
    'NotificationService'
  ];
  
  return Array.from(new Set(extractedParticipants)).slice(0, 8);
}

// Extract messages from text for sequence diagrams
function extractMessages(text: string): Array<{ from: string; to: string; content: string }> {
  const messages: Array<{ from: string; to: string; content: string }> = [];
  
  // Simple pattern extraction
  const patterns = [
    /(\w+)\s+(?:sends|requests|asks)\s+(?:to|for)\s+(\w+)\s+(?:about|for)\s+([^.!?]+)/gi,
    /(\w+)\s+(?:sends|passes|transfers)\s+([^.!?]+?)\s+to\s+(\w+)/gi,
    /(\w+)\s+(?:receives|gets|obtains)\s+([^.!?]+?)\s+from\s+(\w+)/gi,
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const from = match[1];
      const to = match[2];
      const content = match[3] || 'request';
      messages.push({ from, to, content: content.trim() });
    }
  });
  
  return messages.slice(0, 10);
}

// Extract entities for data flow diagrams
function extractEntities(text: string): string[] {
  return extractActors(text);
}

// Extract processes for data flow diagrams
function extractProcesses(text: string): string[] {
  const patterns = [
    /(?:the)?\s*(\w+(?:\s+\w+)*)\s+process(?:es)?\s+(?:the)?\s*(\w+(?:\s+\w+)*)/gi,
    /(?:when)?\s*(?:the)?\s*(\w+(?:\s+\w+)*)\s+(?:is|are)\s+(?:processed|handled|managed)\s+(?:by)?\s*(\w+(?:\s+\w+)*)/gi,
    /(\w+(?:\s+\w+)*)\s+(?:is|are)\s+(?:created|updated|deleted|read)\s+(?:by)?\s*(\w+(?:\s+\w+)*)/gi,
  ];
  
  const matches: string[] = [];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const extracted = match[1].trim();
      if (extracted && !matches.includes(extracted)) {
        matches.push(extracted);
      }
    }
  });
  
  return matches.slice(0, 10);
}

// Extract data stores for data flow diagrams
function extractDataStores(text: string): string[] {
  const patterns = [
    /\b(database|storage|repository|data store|file system|cache|table|collection)\b/gi,
  ];
  
  const matches: string[] = [];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const extracted = match[1].trim();
      if (extracted && !matches.includes(extracted)) {
        matches.push(extracted);
      }
    }
  });
  
  return matches;
}

// Extract data flows for data flow diagrams
function extractDataFlows(text: string, entities: string[], processes: string[], dataStores: string[]): Array<{ source: string; target: string }> {
  const flows: Array<{ source: string; target: string }> = [];
  
  // Create flows between entities and processes
  entities.forEach((entity, index) => {
    if (processes.length > 0) {
      flows.push({ 
        source: `E${index}`, 
        target: `P${Math.min(index, processes.length - 1)}` 
      });
    }
  });
  
  // Create flows between processes and data stores
  processes.forEach((process, index) => {
    if (dataStores.length > 0) {
      flows.push({ 
        source: `P${index}`, 
        target: `DS${Math.min(index, dataStores.length - 1)}` 
      });
    }
  });
  
  return flows;
}

// Generate traceability map linking diagram elements to source text
function generateTraceabilityMap(text: string, diagram: string): UmlResponse['traceabilityMap'] {
  const traceabilityMap: UmlResponse['traceabilityMap'] = {};
  
  // Find relevant parts of the text for each element
  // This is a simplified implementation
  const elementPatterns = [
    { regex: /E\d+\[(.*?)\]/g, prefix: 'E' },  // Entities
    { regex: /P\d+\((.*?)\)/g, prefix: 'P' },  // Processes
    { regex: /DS\d+\[(.*?)\]/g, prefix: 'DS' }, // Data stores
    { regex: /A\d+\("(.*?)"\)/g, prefix: 'A' }, // Actors
    { regex: /UC\d+\((.*?)\)/g, prefix: 'UC' }, // Use cases
  ];
  
  let elementId = 0;
  
  elementPatterns.forEach(patternInfo => {
    const { regex, prefix } = patternInfo;
    let match;
    
    while ((match = regex.exec(diagram)) !== null) {
      const elementName = match[1];
      const elementIdStr = `${prefix}${match[0].match(/\d+/)?.[0] || elementId++}`;
      
      // Find a relevant snippet in the text
      const snippet = findRelevantText(text, elementName);
      
      traceabilityMap[elementIdStr] = {
        sourceText: snippet.text,
        startIndex: snippet.start,
        endIndex: snippet.end,
        confidence: Math.min(0.8 + Math.random() * 0.2, 1.0) // Random confidence between 0.8-1.0
      };
    }
  });
  
  return traceabilityMap;
}

// Find relevant text for an element
function findRelevantText(text: string, elementName: string): { text: string; start: number; end: number } {
  const lowerText = text.toLowerCase();
  const elementLower = elementName.toLowerCase();
  
  const index = lowerText.indexOf(elementLower);
  
  if (index !== -1) {
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + elementName.length + 50);
    const snippet = text.substring(start, end).trim();
    
    return {
      text: snippet,
      start,
      end
    };
  }
  
  // If element not found, return first 100 characters
  return {
    text: text.substring(0, 100),
    start: 0,
    end: Math.min(text.length, 100)
  };
}

// Find source text for a specific element ID
function findSourceText(diagram: string, elementId: string): string {
  // This is a simplified implementation
  // In a real app, we'd use the stored traceability map to find the source
  return `Sample source text mapped to element ${elementId}. This would show the exact text in the document that the element represents.`;
}