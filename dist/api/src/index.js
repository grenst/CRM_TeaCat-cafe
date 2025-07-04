"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const bot_1 = require("@my-workspace/bot");
const app = (0, fastify_1.default)({
    logger: true
});
// Initialize Telegram bot with webhook support
(0, bot_1.createBot)(app);
app.get('/health', async () => {
    return { status: 'ok' };
});
const start = async () => {
    try {
        await app.listen({ port: 3000 });
        app.log.info(`Server listening on port 3000`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
