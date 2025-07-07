"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBot = createBot;
const telegraf_1 = require("telegraf");
const bullmq_1 = require("bullmq");
function createBot(app) {
    const token = process.env.TG_TOKEN;
    if (!token) {
        throw new Error('TG_TOKEN environment variable is required');
    }
    const bot = new telegraf_1.Telegraf(token);
    const queue = new bullmq_1.Queue('new-message', {
        connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
    });
    // Webhook setup
    app.post(`/telegram/${token}`, async (request, reply) => {
        try {
            await bot.handleUpdate(request.body, reply.raw);
            reply.code(200).send({ status: 'ok' });
        }
        catch (error) {
            console.error('Error handling update:', error);
            reply.code(500).send({ error: 'Internal server error' });
        }
    });
    // Health check endpoint
    app.get('/healthz', (_, reply) => {
        reply.code(200).send('OK');
    });
    // Type guard for text messages
    const isTextMessage = (msg) => !!msg?.text;
    bot.on('text', async (ctx) => {
        if (!ctx.message || !isTextMessage(ctx.message))
            return;
        const jobData = {
            chatId: ctx.chat?.id,
            fromId: ctx.from?.id,
            text: ctx.message.text,
        };
        if (!jobData.chatId || !jobData.fromId) {
            return;
        }
        try {
            await queue.add('process-message', jobData);
            await ctx.reply('Message received and queued');
        }
        catch (error) {
            console.error('Failed to queue message:', error);
            await ctx.reply('Error processing message');
        }
    });
    // Initialize webhook on startup
    app.addHook('onReady', async () => {
        await bot.telegram.setWebhook(`${process.env.BASE_URL}/telegram/${token}`);
    });
}
