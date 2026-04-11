import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    const factoryId = client.handshake.auth['factoryId'] as string | undefined;
    if (factoryId) {
      void client.join(`factory:${factoryId}`);
      this.logger.log(`Notification client ${client.id} joined factory:${factoryId}`);
    }
  }

  emitToFactory(factoryId: string, event: string, data: unknown) {
    this.server.to(`factory:${factoryId}`).emit(event, data);
  }
}
