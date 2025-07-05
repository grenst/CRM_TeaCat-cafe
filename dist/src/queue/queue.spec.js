const { messageQueue } = await import('./index.js');
const { Job: JobClass, Worker: WorkerClass } = await import('bullmq');
describe('messageQueue', () => {
    let worker;
    afterEach(async () => {
        if (worker) {
            await worker.close();
        }
        await messageQueue.obliterate({ force: true });
        await messageQueue.disconnect();
    });
    it('should retry a failed job 3 times', async () => {
        const jobProcessor = jest.fn().mockRejectedValue(new Error('Job failed'));
        worker = new WorkerClass('messages', jobProcessor, {
            connection: messageQueue.opts.connection,
        });
        const job = await messageQueue.add('test-job', { some: 'data' });
        await new Promise((resolve) => {
            worker.on('failed', (job) => {
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
export {};
