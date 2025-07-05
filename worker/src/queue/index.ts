import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined in the environment variables.');
}

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const messageQueue = new Queue('messages', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});
