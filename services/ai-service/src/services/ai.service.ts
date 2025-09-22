import OpenAI from 'openai';
import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { config } from '../config';

export class AIService {
  private openai: OpenAI;
  private sentenceEncoder: use.UniversalSentenceEncoder | null = null;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
  }

  /**
   * Initialize the sentence encoder
   */
  async initialize(): Promise<void> {
    if (this.sentenceEncoder) {
      return; // Already initialized
    }
    
    try {
      await tf.ready();
      this.sentenceEncoder = await use.load();
      console.log('Sentence encoder loaded successfully');
    } catch (error) {
      console.error('Failed to load sentence encoder:', error);
      throw new Error('Failed to initialize AI service');
    }
  }

  /**
   * Generate SRS/SDS document based on requirements
   */
  async generateDocument(requirements: string, docType: 'srs' | 'sds' = 'srs'): Promise<string> {
    if (!requirements) {
      throw new Error('Requirements cannot be empty');
    }
    try {
      const prompt = this.getDocumentGenerationPrompt(requirements, docType);
      
      const response = await this.openai.chat.completions.create({
        model: config.OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are a technical writer who creates clear and detailed software documentation.' },
          { role: 'user', content: prompt }
        ],
        temperature: config.TEMPERATURE,
        max_tokens: config.MAX_TOKENS,
      });

      return response.choices[0]?.message?.content || 'Failed to generate document';
    } catch (error) {
      console.error('Error generating document:', error);
      throw new Error(`Failed to generate ${docType.toUpperCase()} document`);
    }
  }

  /**
   * Check consistency between code and documentation
   */
  async checkConsistency(code: string, documentation: string): Promise<{
    isConsistent: boolean;
    confidence: number;
    mismatches: Array<{
      codeSnippet: string;
      docSnippet: string;
      similarity: number;
    }>;
  }> {
    if (!code || !documentation) {
      throw new Error('Code and documentation cannot be empty');
    }

    if (!this.sentenceEncoder) {
      throw new Error('AI service not initialized. Call initialize() first.');
    }

    try {
      // Split code and documentation into meaningful chunks
      const codeChunks = this.splitIntoChunks(code, 200);
      const docChunks = this.splitIntoChunks(documentation, 200);

      // Get embeddings for all chunks
      const codeEmbeddings = await this.getEmbeddings(codeChunks);
      const docEmbeddings = await this.getEmbeddings(docChunks);

      // Find similar chunks
      const mismatches: Array<{
        codeSnippet: string;
        docSnippet: string;
        similarity: number;
      }> = [];

      // Compare each code chunk with each documentation chunk
      for (let i = 0; i < codeChunks.length; i++) {
        let maxSimilarity = 0;
        let bestMatchIndex = -1;

        for (let j = 0; j < docChunks.length; j++) {
          const similarity = this.cosineSimilarity(
            codeEmbeddings[i],
            docEmbeddings[j]
          );

          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            bestMatchIndex = j;
          }
        }

        if (maxSimilarity < config.SIMILARITY_THRESHOLD && bestMatchIndex !== -1) {
          mismatches.push({
            codeSnippet: codeChunks[i],
            docSnippet: docChunks[bestMatchIndex],
            similarity: maxSimilarity,
          });
        }
      }

      return {
        isConsistent: mismatches.length === 0,
        confidence: 1 - (mismatches.length / Math.max(codeChunks.length, 1)),
        mismatches,
      };
    } catch (error) {
      console.error('Error checking consistency:', error);
      throw new Error('Failed to check code-documentation consistency');
    }
  }

  /**
   * Get embeddings for text chunks using Universal Sentence Encoder
   */
  private async getEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.sentenceEncoder) {
      throw new Error('Sentence encoder not initialized');
    }

    const embeddings = await this.sentenceEncoder.embed(texts);
    return Array.from(embeddings.arraySync());
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const vecASize = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const vecBSize = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    
    if (vecASize === 0 || vecBSize === 0) return 0;
    return dotProduct / (vecASize * vecBSize);
  }

  /**
   * Split text into chunks of approximately equal token count
   */
  private splitIntoChunks(text: string, maxTokens: number): string[] {
    // Simple implementation - split by sentences for now
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const sentence of sentences) {
      const sentenceLength = sentence.split(/\s+/).length;
      
      if (currentLength + sentenceLength > maxTokens && currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
        currentLength = 0;
      }
      
      currentChunk.push(sentence);
      currentLength += sentenceLength;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks;
  }

  /**
   * Generate prompt for document generation
   */
  private getDocumentGenerationPrompt(requirements: string, docType: 'srs' | 'sds'): string {
    const docTypeName = docType.toUpperCase() === 'SRS' 
      ? 'Software Requirements Specification (SRS)' 
      : 'Software Design Specification (SDS)';
    
    return `Create a detailed ${docTypeName} document based on the following requirements:

${requirements}

Please provide a well-structured document with appropriate sections, clear requirements/design elements, and any necessary diagrams or technical details.`;
  }
}

// Singleton instance
export const aiService = new AIService();
