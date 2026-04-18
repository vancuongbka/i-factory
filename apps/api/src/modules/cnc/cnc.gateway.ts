import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/cnc', cors: { origin: '*' } })
export class CncGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CncGateway.name);

  handleConnection(client: Socket) {
    const factoryId = client.handshake.auth['factoryId'] as string | undefined;
    if (factoryId) {
      void client.join(`factory:${factoryId}`);
      this.logger.log(`CNC client ${client.id} joined factory:${factoryId}`);
    }
  }

  emitToFactory(factoryId: string, event: string, data: unknown) {
    this.server.to(`factory:${factoryId}`).emit(event, data);
  }
}
