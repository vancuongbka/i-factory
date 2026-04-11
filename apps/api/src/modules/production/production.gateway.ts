import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/production', cors: { origin: '*' } })
export class ProductionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ProductionGateway.name);

  handleConnection(client: Socket) {
    // TODO: validate JWT from handshake and join factory room
    const factoryId = client.handshake.auth['factoryId'] as string | undefined;
    if (factoryId) {
      void client.join(`factory:${factoryId}`);
      this.logger.log(`Client ${client.id} joined factory:${factoryId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  emitToFactory(factoryId: string, event: string, data: unknown) {
    this.server.to(`factory:${factoryId}`).emit(event, data);
  }
}
