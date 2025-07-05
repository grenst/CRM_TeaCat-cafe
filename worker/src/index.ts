import 'reflect-metadata';
import { Worker } from 'bullmq';
import { DataSource } from 'typeorm';
import { franc } from 'franc';
import Sentiment from 'sentiment';
import { MessageEntity } from './entity/MessageEntity.js';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  entities: [MessageEntity],
  synchronize: true
});

const worker = new Worker('new-message', async job => {
  try {
    const { chatId, messageId, text } = job.data;
    
    // Detect language
    const langCode = franc(text, { minLength: 3 });
    const language = langCode === 'und' ? 'unknown' : langCode;
    
    // Analyze sentiment
    const sentiment = new Sentiment();
    const { score } = sentiment.analyze(text);
    
    // Save to database
    const repo = dataSource.getRepository(MessageEntity);
    await repo.save({
      chatId,
      messageId,
      text,
      language,
      sentimentScore: score
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Failed processing message ${job.data.messageId}:`, error);
    throw error; // Ensure BullMQ retry logic works
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

process.on('SIGINT', async () => {
  await worker.close();
  await dataSource.destroy();
  process.exit(0);
});