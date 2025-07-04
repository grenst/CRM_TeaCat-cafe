import Fastify from 'fastify';
import { createBot } from '@my-workspace/bot';

const app = Fastify({
  logger: true
});

// Initialize Telegram bot with webhook support
createBot(app);

app.get('/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    app.log.info(`Server listening on port 3000`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();