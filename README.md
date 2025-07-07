# CRM TeaCat Cafe

A modular, scalable **Telegram-based CRM system** designed for small businesses, cafes, and service teams. This project automates customer communication analysis, provides live operational metrics, and visualizes business performance in real time via a modern dashboard.

---

## 🔑 Key Features

### ☕ Telegram CRM Bot

- Collects and processes all incoming messages from Telegram chats.
- Supports groups, supergroups, and private chats.
- Automatically queues messages for processing and enrichment.
- Detects language and analyzes message sentiment using **franc** and **sentiment** libraries.
- Saves enriched message data into a PostgreSQL database using **TypeORM**.

### 📊 Realtime Dashboard (React + Chakra UI)

- Displays live business KPIs and customer interaction metrics.
- Provides real-time WebSocket-powered updates for:
  - SLA (% of timely replies)
  - Messages per minute
  - Customer sentiment distribution
- Built with **Vite**, **Recharts**, and **React Query** for efficient rendering.

### ⚙️ Distributed Architecture

- **NestJS API service** exposes:
  - Swagger-based REST API for users and messages.
  - WebSocket gateway streaming real-time metrics.
  - Validation & OpenAPI auto-generation.
- **Worker service** processes message queues (BullMQ) and stores enriched data.
- **Infrastructure module** ready for future scaling with database migrations, Redis, and monitoring.

### 🚀 Technologies Used

- TypeScript Monorepo (PnPM Workspace)
- NestJS, BullMQ, TypeORM, ioredis, PostgreSQL
- Telegraf (Telegram Bot Framework)
- React 19, Chakra UI, Recharts
- Jest, ESLint, Prettier for code quality
- Vite for frontend development
- Docker/Helm deployment-ready structure (planned)

---

## 🌟 Future Perspectives

### Platform Growth

- Add multi-tenant support for multiple cafes or businesses.
- Introduce role-based access controls for team management.
- Support additional communication channels (WhatsApp, Viber, etc.).

### Advanced Analytics

- Implement NLP-powered intent recognition.
- Add customer engagement scoring.
- Enhance SLA tracking with customizable alerting thresholds.

### Automation

- Replace fake metrics with real ones from the database and message processing pipeline.
- Integrate external monitoring tools like **Prometheus**, **Grafana**, and alerts to Discord or Telegram admin channels.
- Add automatic workflows for follow-up messages or task assignment.

### Deployment & Observability

- Full Helm charts for Kubernetes deployment.
- Integrate Prometheus metrics (`/metrics`) into the NestJS services.
- Real-time alerts via Discord, Telegram, or other channels (Slack optional).

---

## ✅ Current Roadmap

- [x] Telegram bot with queue-based message processing.
- [x] Worker service: language detection, sentiment analysis, PostgreSQL storage.
- [x] Live React dashboard for key KPIs.
- [x] NestJS API with Swagger documentation and basic user/message routes.
- [x] Local development with PostgreSQL and Redis.
- [ ] Replace dummy metrics in WebSocket gateway with real business metrics.
- [ ] Add full Prometheus + Grafana + Alertmanager stack.
- [ ] Implement advanced user management and authentication.
- [ ] Production-ready Docker Compose & Helm charts.

---

## 📂 Repository Structure

```
/api        - NestJS REST API & WebSocket Gateway
/bot        - Telegram bot (Telegraf + Fastify)
/worker     - BullMQ worker + sentiment/language analysis
/dashboard  - React dashboard for real-time metrics
/infra      - Infrastructure module (for future use)
```

---