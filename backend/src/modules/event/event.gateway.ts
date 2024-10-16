import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseFilters, UseGuards } from '@nestjs/common';
import { DocService } from '../doc/services/doc.service';
import { PermissionsService } from '../doc/services/permissions.service';
import { DocumentStateService } from '../doc/services/document-state.service';
import { EventExceptionFilter } from './filters/event-exception.filter';
import { UserDocument } from '../user/schemas/user.schema';
import { WsGetUser } from '../user/decorators/user.decorator';
import { AuthenticatedGuard } from '../auth/guards';
import { PermissionGuard } from '../doc/guards';
import {
  RequireReadPermission,
  RequireWritePermission,
} from '../doc/decorators/permission.decorator';

// SearchStringTroubleshoot.
// This is a major WIP. Basic implementation to develop given more time.

@UseFilters(EventExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly docService: DocService,
    private readonly permissionsService: PermissionsService,
    private readonly documentStateService: DocumentStateService
  ) {}

  async handleConnection(client: Socket) {
    const user = client.data.user as UserDocument;

    if (!user) {
      console.log('User unauthorized, disconnecting');
      client.disconnect();
      return;
    }

    console.log(`User ${user.discordId} connected.`);
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user as UserDocument;
    console.log(`User ${user?.discordId} disconnected.`);
  }

  @SubscribeMessage('joinDocument')
  @UseGuards(AuthenticatedGuard, PermissionGuard)
  @RequireReadPermission()
  async handleJoinDocument(
    @WsGetUser() user: UserDocument,
    client: Socket,
    docId: string
  ) {
    await this.docService.findByDocId(docId);
    client.join(docId);
    client.emit('joinedDocument', {
      message: 'Successfully joined document room.',
    });
  }

  @SubscribeMessage('leaveDocument')
  @UseGuards(AuthenticatedGuard)
  async handleLeaveDocument(
    @WsGetUser() user: UserDocument,
    client: Socket,
    docId: string
  ) {
    const permission = await this.permissionsService.findPermission(
      docId,
      user.discordId
    );

    if (permission === 'WRITE' || permission === 'ADMIN') {
      this.documentStateService.saveDocumentState(docId);
    }

    client.leave(docId);

    client.emit('leftDocument', {
      message: 'Successfully left document room.',
    });

    this.server.to(docId).emit('userLeft', {
      discordId: user.discordId,
      message: 'User left the document.',
    });

    const remainingClients = this.server.sockets.adapter.rooms.get(docId);
    if (!remainingClients || remainingClients.size === 0) {
      this.documentStateService.cleanUpCache();
    }
  }

  @SubscribeMessage('updateDocument')
  @UseGuards(AuthenticatedGuard, PermissionGuard)
  @RequireWritePermission()
  async handleUpdateDocument(
    @WsGetUser() user: UserDocument,
    client: Socket,
    docId: string,
    content: string
  ) {
    await this.docService.findByDocId(docId);
    this.documentStateService.updateDocumentState(docId, content);
    this.server.to(docId).emit('documentUpdated', { docId, content });
  }
}
