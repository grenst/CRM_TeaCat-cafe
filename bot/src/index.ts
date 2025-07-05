import { Telegraf, type Context } from 'telegraf';
import type { FastifyInstance } from 'fastify';
import { Queue } from 'bullmq';

interface TelegramMessage {
  chatId: number;
  fromId: number;
  text: string;
}

export function createBot(app: FastifyInstance): void {
  const token = process.env.TG_TOKEN;
  if (!token) {
    throw new Error('TG_TOKEN environment variable is required');
  }

  const bot = new Telegraf(token);
  const queue = new Queue<TelegramMessage>('new-message', {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
  });

  // Webhook setup
  app.post(`/telegram/${token}`, async (request, reply) => {
    try {
      await bot.handleUpdate(request.body as any, reply.raw);
      reply.code(200).send({ status: 'ok' });
    } catch (error) {
      console.error('Error handling update:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Health check endpoint
  app.get('/healthz', (_, reply) => {
    reply.code(200).send('OK');
  });

  // Type guard for text messages
  const isTextMessage = (msg: any): msg is { text: string } => !!msg?.text;
  
  bot.on('text', async (ctx: Context) => {
    if (!ctx.message || !isTextMessage(ctx.message)) return;

    const jobData = {
      chatId: ctx.chat?.id,
      fromId: ctx.from?.id,
      text: ctx.message.text,
    };

    if (!jobData.chatId || !jobData.fromId) {
      return;
    }

    try {
      await queue.add('process-message', jobData as TelegramMessage);
      await ctx.reply('Message received and queued');
    } catch (error) {
      console.error('Failed to queue message:', error);
      await ctx.reply('Error processing message');
    }
  });

  // Initialize webhook on startup
  app.addHook('onReady', async () => {
    await bot.telegram.setWebhook(`${process.env.BASE_URL}/telegram/${token}`);
  });
}