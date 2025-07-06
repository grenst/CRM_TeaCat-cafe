import { jest } from '@jest/globals';
import { Worker } from 'bullmq';
import { DataSource } from 'typeorm';
import RedisMock from 'ioredis-mock';
import { MessageEntity } from '../src/entity/MessageEntity.js';

jest.mock('../src/queue/index.ts', () => ({
  messageQueue: {
    add: jest.fn(),
    opts: { connection: new RedisMock() },
    obliterate: jest.fn(() => Promise.resolve()),
    disconnect: jest.fn(() => Promise.resolve()),
  },
}));

const mockSave = jest.fn();
jest.mock('typeorm', () => ({
  DataSource: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(() => Promise.resolve()),
    getRepository: jest.fn(() => ({
      save: mockSave,
    })),
    destroy: jest.fn(() => Promise.resolve()),
  })),
  Entity: () => jest.fn(),
  PrimaryGeneratedColumn: () => jest.fn(),
  Column: () => jest.fn(),
  CreateDateColumn: () => jest.fn(),
}));

describe('Worker', () => {
  let workerProcessor: Function;
  let dataSource: DataSource;

  beforeAll(async () => {
    const workerModule = await import('../src/index.js');
    workerProcessor = (workerModule as any).defaultWorkerProcessor;
    dataSource = (workerModule as any).dataSource;
  });

  afterEach(() => {
    mockSave.mockClear();
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should process a message, detect language, analyze sentiment, and save to DB', async () => {
    const job = {
      data: {
        chatId: 'test-chat-id',
        messageId: 'test-message-id',
        text: 'Hello, this is a test message.',
      },
    };

    await workerProcessor(job);

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      chatId: job.data.chatId,
      messageId: job.data.messageId,
      text: job.data.text,
      language: expect.any(String),
      sentimentScore: expect.any(Number),
    }));

  });
});