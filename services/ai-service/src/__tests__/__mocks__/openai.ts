const mockChatCompletion = {
  choices: [
    {
      message: {
        content: 'Mock generated document content',
      },
    },
  ],
};

const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue(mockChatCompletion),
    },
  },
};

export { mockOpenAI, mockChatCompletion };
