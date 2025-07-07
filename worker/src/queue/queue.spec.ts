import { jest } from '@jest/globals';

const { messageQueue } = await import('./index.js');
import type { Job, Worker } from 'bullmq';

const { Job: JobClass, Worker: WorkerClass } = await import('bullmq');

describe('messageQueue', () => {
  let worker: Worker;
  let jobProcessor: jest.Mock;

  beforeAll(async () => {
    // Ensure the queue is connected before all tests
    await messageQueue.waitUntilReady();
  });

  beforeEach(async () => {
    const processorFn = async () => {
      throw new Error('Job failed');
    };
    jobProcessor = jest.fn(processorFn as () => Promise<void>);

    worker = new WorkerClass('messages', jobProcessor, {
      connection: messageQueue.opts.connection,
    });
    await new Promise<void>((resolve) => worker.on('ready', resolve));
  });

  afterEach(async () => {
    if (worker) {
      await worker.close();
    }
  }, 30000);

  afterAll(async () => {
    // Close the queue connection after all tests
    await messageQueue.close();
  });

  it('should retry a failed job 3 times', async () => {
    const job = await messageQueue.add('test-job', { some: 'data' }, { attempts: 3 });
    if (!job) {
      throw new Error('Job object is null or undefined after messageQueue.add');
    }
    if (!job.id) {
      throw new Error('Job ID is not defined');
    }

    // Wait for job to be processed by listening to worker events
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Job processing timeout'));
      }, 25000);

      worker.on('failed', async (failedJob, err) => {
        if (failedJob.id === job.id) {
          // Check if this is the final failure (after all retries)
          const updatedJob = await JobClass.fromId(messageQueue, failedJob.id);
          if (updatedJob && updatedJob.attemptsMade >= 3) {
            clearTimeout(timeout);
            resolve();
          }
        }
      });
    });

    expect(jobProcessor).toHaveBeenCalledTimes(3); // 1 initial + 2 retries (total 3 attempts)
    const completedJob = await JobClass.fromId(messageQueue, job.id);
    expect(completedJob?.attemptsMade).toBe(3);
  }, 30000);
});