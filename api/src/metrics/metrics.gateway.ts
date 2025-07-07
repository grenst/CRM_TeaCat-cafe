/* eslint-disable @typescript-eslint/no-unsafe-assignment */
interface Server {
  clients: Set<WebSocket>;
}
interface WebSocket {
  readyState: number;
  OPEN: number;
  send(data: any): void;
}
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';

@WebSocketGateway()
export class MetricsGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  afterInit() {
    const wsServer = this.server;
    setInterval(() => {
      const dummyMetrics = {
        messagesPerMinute: Math.random() * 20,
        slaPercentage: 90 + Math.random() * 10,
        sentiment: {
          positive: Math.random(),
          negative: Math.random(),
          neutral: Math.random(),
        },
      };
      const sum =
        dummyMetrics.sentiment.positive +
        dummyMetrics.sentiment.negative +
        dummyMetrics.sentiment.neutral;
      dummyMetrics.sentiment.positive /= sum;
      dummyMetrics.sentiment.negative /= sum;
      dummyMetrics.sentiment.neutral /= sum;

      for (const client of wsServer.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(dummyMetrics));
        }
      }
    }, 3000); // Send data every 3 seconds
  }

  @SubscribeMessage('message')
  handleMessage(client: WebSocket, payload: unknown): void {
    // This method will still be here if the client decides to send messages later
    client.send(
      JSON.stringify({
        message: 'Message received!',
        originalPayload: payload as any,
      }),
    );
  }
}
