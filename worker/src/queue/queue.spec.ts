import { jest } from '@jest/globals';

const { messageQueue } = await import('./index.js');
import type { Job, Worker } from 'bullmq';

const { Job: JobClass, Worker: WorkerClass } = await import('bullmq');

describe('messageQueue', () => {
  let worker: Worker;

  afterEach(async () => {
    if (worker) {
      await worker.close();
    }
    await messageQueue.obliterate({ force: true });
    await messageQueue.disconnect();
  }, 30000);

  it('should retry a failed job 3 times', async () => {
    const processorFn = async () => {
      throw new Error('Job failed');
    };
    const jobProcessor = jest.fn(processorFn as () => Promise<void>);

    worker = new WorkerClass('messages', jobProcessor, {
      connection: messageQueue.opts.connection,
    });

    const job = await messageQueue.add('test-job', { some: 'data' }, { attempts: 3 });

    await new Promise<void>((resolve) => {
      worker.on('failed', (job: Job | undefined) => {
        if (job && job.attemptsMade === 3) {
          resolve();
        }
      });
    });

    expect(jobProcessor).toHaveBeenCalledTimes(3);
    if (!job.id) {
      throw new Error('Job ID is not defined');
    }
    const completedJob = await JobClass.fromId(messageQueue, job.id);
    expect(completedJob?.attemptsMade).toBe(3);
  }, 30000);
});