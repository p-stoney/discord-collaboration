import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseFilters, UseGuards } from '@nestjs/common';
import { DocService, DocumentStateService } from '../doc/services';
import { EventExceptionFilter } from './filters/event-exception.filter';
import {
  RequireReadPermission,
  RequireWritePermission,
} from '../doc/decorators/permission.decorator';
import { WsAuthenticatedGuard } from '../auth/guards';
import { WsPermissionGuard } from '../doc/guards';
import { AuthenticatedSocket } from '../auth/interfaces/authenticated.interface';

@UseFilters(EventExceptionFilter)
@UseGuards(WsAuthenticatedGuard, WsPermissionGuard)
@WebSocketGateway({
  path: '/socket.io',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly docService: DocService,
    private readonly documentStateService: DocumentStateService
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    console.log('handleConnection triggered');

    const user = client.handshake.user;

    if (!user) {
      console.log('User unauthorized, disconnecting');
      client.disconnect();
      return;
    }

    console.log(`User ${user.discordId} connected.`);
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const user = client.handshake.user;
    console.log(`User ${user?.discordId} disconnected.`);
  }

  @SubscribeMessage('joinDocument')
  @RequireReadPermission()
  async handleJoinDocument(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { docId: string }
  ) {
    try {
      const docId = data.docId;
      client.join(docId);

      let content = await this.documentStateService.getDocumentState(docId);

      if (!content) {
        const document = await this.docService.findByDocId(docId);
        content = document?.content || '';
        await this.documentStateService.updateDocumentState(docId, content);
      }

      client.emit('joinedDocument', {
        message: 'Successfully joined document room.',
        content,
      });
    } catch (error) {
      client.emit('error', {
        message: 'An error occurred while joining the document.',
      });
      console.error('Error in handleJoinDocument:', error);
    }
  }

  @SubscribeMessage('updateDocument')
  @RequireWritePermission()
  async handleUpdateDocument(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { docId: string; content: string }
  ) {
    try {
      const { docId, content } = data;
      console.log('Received updateDocument event:', { docId, content });

      await this.documentStateService.updateDocumentState(docId, content);

      client.to(docId).emit('documentUpdated', { content });

      this.documentStateService.saveToDatabase(docId);
    } catch (error) {
      client.emit('error', {
        message: 'An error occurred while updating the document.',
      });
      console.error('Error in handleUpdateDocument:', error);
    }
  }
}
