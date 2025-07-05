import { __mockReply } from 'telegraf';
import fastify, { FastifyInstance } from 'fastify';
import { Queue } from 'bullmq';
import { createBot } from './index';

// Mock external dependencies
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' })
  }))
}));


// Mock Telegraf
jest.mock('telegraf', () => {
  const __mockOnText = jest.fn();
  const __mockReply = jest.fn(); // New mock for ctx.reply
  
  return {
    Telegraf: jest.fn().mockImplementation(() => ({
      telegram: {
        setWebhook: jest.fn().mockResolvedValue(true),
        sendMessage: jest.fn().mockResolvedValue(true)
      },
      launch: jest.fn(),
      use: jest.fn(),
      on: jest.fn().mockImplementation((event, handler) => {
        if (event === 'text') __mockOnText.mockImplementation(handler);
      }),
      handleUpdate: jest.fn().mockImplementation(async (update) => {
        // Simulate processing a text message
        if (update?.message?.text) {
          await __mockOnText({
            message: update.message,
            chat: { id: update.message.chat.id },
            from: { id: update.message.from.id },
            reply: __mockReply // Use the exposed mockReply
          });
        }
        return true;
      }),
      webhookCallback: jest.fn().mockReturnValue(() => {})
    })),
    __mockOnText, // Export for testing
    __mockReply // Export for testing
  };
});

describe('Telegram webhook handler', () => {
  let server: FastifyInstance;

  beforeAll(() => {
    process.env.TG_TOKEN = 'mock-token';
    process.env.BASE_URL = 'http://test.local';
  });

  beforeEach(async () => {
    server = fastify();
    
    // Create fresh mock queue instance for each test
    // const mockQueue = new Queue('test') as jest.Mocked<Queue>;
  });

  afterEach(async () => {
    await server.close();
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    process.env.TG_TOKEN = 'mock-token';
    process.env.BASE_URL = 'http://test.local';
    server = fastify();
    
    // Initialize mock queue with proper type assertion
    // const mockQueue = new Queue('test') as jest.Mocked<Queue>;
  });

  afterEach(async () => {
    await server.close();
    jest.clearAllMocks();
  });

  it('should add message to queue', async () => {
    // Setup mock queue add implementation
    const mockAdd = jest.fn().mockResolvedValue({ id: 'mock-job-id' });
    (Queue as unknown as jest.Mock).mockImplementation(() => ({
      add: mockAdd
    }));

    createBot(server);
    await server.ready();

    const testPayload = {
      update_id: 1,
      message: {
        message_id: 1,
        text: 'Test',
        chat: { id: 123 },
        from: { id: 456 }
      }
    };

    const response = await server.inject({
      method: 'POST',
      url: `/telegram/mock-token`,
      payload: testPayload
    });

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    // Check response
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
    
    // Verify queue interaction
    expect(mockAdd).toHaveBeenCalledTimes(1);
    const [jobName, jobData] = mockAdd.mock.calls[0];
    expect(jobName).toBe('process-message');
    expect(jobData).toEqual({
      chatId: 123,
      fromId: 456,
      text: 'Test'
    });
  });

  it('should handle messages with missing text field', async () => {
    const mockAdd = jest.fn().mockResolvedValue({ id: 'mock-job-id' });
    (Queue as unknown as jest.Mock).mockImplementation(() => ({
      add: mockAdd
    }));

    createBot(server);
    await server.ready();

    const testPayload = {
      update_id: 1,
      message: {
        message_id: 1,
        chat: { id: 123 },
        from: { id: 456 }
      }
    };

    const response = await server.inject({
      method: 'POST',
      url: `/telegram/mock-token`,
      payload: testPayload
    });

    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(response.statusCode).toBe(200);
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('should call ctx.reply on valid message', async () => {
    const mockAdd = jest.fn().mockResolvedValue({ id: 'mock-job-id' });
    (Queue as unknown as jest.Mock).mockImplementation(() => ({
      add: mockAdd
    }));

    createBot(server);
    await server.ready();

    const testPayload = {
      update_id: 1,
      message: {
        message_id: 1,
        text: 'Test',
        chat: { id: 123 },
        from: { id: 456 }
      }
    };

    await server.inject({
      method: 'POST',
      url: `/telegram/mock-token`,
      payload: testPayload
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    // Get the first argument (context) passed to the text handler
    expect((__mockReply as jest.Mock)).toHaveBeenCalledWith('Message received and queued');
  });
});