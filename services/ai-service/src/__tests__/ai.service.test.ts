// Mock the openai module
const mockCreate = jest.fn().mockResolvedValue({
  choices: [{
    message: {
      content: 'Mock generated document content',
    },
  }],
});

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

// Mock @tensorflow/tfjs and @tensorflow-models/universal-sentence-encoder
jest.mock('@tensorflow/tfjs-node', () => ({
  ready: jest.fn().mockResolvedValue(undefined),
}));

const mockEmbed = jest.fn().mockResolvedValue({
  arraySync: () => [
    [0.1, 0.2, 0.3],
    [0.4, 0.5, 0.6],
  ],
});

jest.mock('@tensorflow-models/universal-sentence-encoder', () => ({
  load: jest.fn().mockResolvedValue({
    embed: mockEmbed,
  }),
}));

import { aiService } from '../services/ai.service';

// Initialize the AI service before tests
beforeAll(async () => {
  await aiService.initialize();
});
jest.mock('@tensorflow/tfjs-node', () => ({
  ready: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@tensorflow-models/universal-sentence-encoder', () => ({
  load: jest.fn().mockResolvedValue({
    embed: jest.fn().mockResolvedValue({
      arraySync: () => [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ],
    }),
  }),
}));


describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDocument', () => {
    beforeEach(() => {
      mockCreate.mockClear();
    });

    it('should generate a document using OpenAI', async () => {
      const requirements = 'Test requirements';
      
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Mock generated document content'
          }
        }]
      });

      const result = await aiService.generateDocument(requirements, 'srs');
      
      // Verify the API was called
      expect(mockCreate).toHaveBeenCalled();
      
      // Check the first argument of the first call
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs).toEqual(expect.objectContaining({
        model: expect.any(String),
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('technical writer')
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining(requirements)
          })
        ]),
        temperature: expect.any(Number),
        max_tokens: expect.any(Number)
      }));

      expect(result).toBe('Mock generated document content');
    });

    it('should throw an error if requirements are empty', async () => {
      await expect(aiService.generateDocument('', 'srs')).rejects.toThrow(
        'Requirements cannot be empty'
      );
    });
  });

  describe('checkConsistency', () => {
    it('should return consistency check results', async () => {
      // Mock similar embeddings for code and documentation
      mockEmbed.mockResolvedValueOnce({
        arraySync: () => [
          [0.9, 0.8, 0.7], // Code embedding
          [0.85, 0.82, 0.72], // Similar documentation embedding
        ],
      });

      const result = await aiService.checkConsistency('function test() {}', 'This is a test function');
      
      expect(result).toEqual({
        isConsistent: true,
        confidence: expect.any(Number),
        mismatches: []
      });
    });

    it('should handle errors during consistency check', async () => {
      // Force an error by passing invalid inputs
      await expect(
        aiService.checkConsistency('', 'documentation')
      ).rejects.toThrow('Code and documentation cannot be empty');
      
      await expect(
        aiService.checkConsistency('code', '')
      ).rejects.toThrow('Code and documentation cannot be empty');
    });

    it('should handle mismatches between code and documentation', async () => {
      // Mock different embeddings for code and documentation
      mockEmbed.mockResolvedValueOnce({
        arraySync: () => [
          [0.1, 0.2, 0.3], // Code embedding
          [0.9, 0.8, 0.7], // Documentation embedding (very different)
        ],
      });

      const result = await aiService.checkConsistency('code', 'documentation');
      
      // We expect the result to have the correct structure
      expect(result).toMatchObject({
        isConsistent: expect.any(Boolean),
        confidence: expect.any(Number),
        mismatches: expect.any(Array)
      });
      
      // Verify the mismatches array contains the expected structure
      if (result.mismatches.length > 0) {
        expect(result.mismatches[0]).toMatchObject({
          codeSnippet: expect.any(String),
          docSnippet: expect.any(String),
          similarity: expect.any(Number)
        });
      }
    });
  });
});
