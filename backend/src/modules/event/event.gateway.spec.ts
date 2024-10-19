import { Test, TestingModule } from '@nestjs/testing';
import { EventGateway } from './event.gateway';
import {
  DocService,
  DocumentStateService,
  PermissionsService,
} from '../doc/services';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../auth/interfaces/extended-request';

describe('EventGateway', () => {
  let gateway: EventGateway;
  let docService: DocService;
  let documentStateService: DocumentStateService;
  let mockServer: Server;

  beforeEach(async () => {
    const mockDocService = {
      findByDocId: jest.fn(),
    };

    const mockDocumentStateService = {
      getDocumentState: jest.fn(),
      updateDocumentState: jest.fn(),
      saveToDatabase: jest.fn(),
    };

    const mockPermissionService = {
      findPermission: jest.fn(),
      hasPermission: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventGateway,
        { provide: DocService, useValue: mockDocService },
        { provide: DocumentStateService, useValue: mockDocumentStateService },
        { provide: PermissionsService, useValue: mockPermissionService },
      ],
    }).compile();

    gateway = module.get<EventGateway>(EventGateway);
    docService = module.get<DocService>(DocService);
    documentStateService =
      module.get<DocumentStateService>(DocumentStateService);

    mockServer = new Server();
    gateway.server = mockServer;

    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should disconnect client if user is not authenticated', () => {
      const mockClient = {
        handshake: {},
        disconnect: jest.fn(),
      } as unknown as AuthenticatedSocket;

      gateway.handleConnection(mockClient);

      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should allow connection if user is authenticated', () => {
      const mockClient = {
        handshake: {
          user: { discordId: '123456789' },
        },
        disconnect: jest.fn(),
      } as unknown as AuthenticatedSocket;

      gateway.handleConnection(mockClient);

      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should log when user disconnects', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockClient = {
        handshake: {
          user: { discordId: '123456789' },
        },
      } as unknown as AuthenticatedSocket;

      gateway.handleDisconnect(mockClient);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'User 123456789 disconnected.'
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('handleJoinDocument', () => {
    it('should handle user joining a document', async () => {
      const mockClient = {
        handshake: {
          user: { discordId: '123456789' },
        },
        join: jest.fn(),
        emit: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const data = { docId: 'doc123' };
      const content = 'Document content';

      (
        documentStateService.getDocumentState as jest.Mock
      ).mockResolvedValueOnce(content);

      await gateway.handleJoinDocument(mockClient, data);

      expect(mockClient.join).toHaveBeenCalledWith('doc123');
      expect(documentStateService.getDocumentState).toHaveBeenCalledWith(
        'doc123'
      );
      expect(mockClient.emit).toHaveBeenCalledWith('joinedDocument', {
        message: 'Successfully joined document room.',
        content,
      });
    });

    it('should load content from database if not in state service', async () => {
      const mockClient = {
        handshake: {
          user: { discordId: '123456789' },
        },
        join: jest.fn(),
        emit: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const data = { docId: 'doc123' };
      const content = 'Document content';

      (
        documentStateService.getDocumentState as jest.Mock
      ).mockResolvedValueOnce(null);
      (docService.findByDocId as jest.Mock).mockResolvedValueOnce({ content });

      await gateway.handleJoinDocument(mockClient, data);

      expect(docService.findByDocId).toHaveBeenCalledWith('doc123');
      expect(documentStateService.updateDocumentState).toHaveBeenCalledWith(
        'doc123',
        content
      );
      expect(mockClient.emit).toHaveBeenCalledWith('joinedDocument', {
        message: 'Successfully joined document room.',
        content,
      });
    });

    it('should handle errors and emit error event', async () => {
      const mockClient = {
        handshake: {
          user: { discordId: '123456789' },
        },
        join: jest.fn(),
        emit: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const data = { docId: 'doc123' };
      const error = new Error('Database error');

      (
        documentStateService.getDocumentState as jest.Mock
      ).mockRejectedValueOnce(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await gateway.handleJoinDocument(mockClient, data);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'An error occurred while joining the document.',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in handleJoinDocument:',
        error
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleUpdateDocument', () => {
    it('should handle document updates and broadcast to others', async () => {
      const mockClient = {
        handshake: {
          user: { discordId: '123456789' },
        },
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const data = { docId: 'doc123', content: 'Updated content' };

      await gateway.handleUpdateDocument(mockClient, data);

      expect(documentStateService.updateDocumentState).toHaveBeenCalledWith(
        'doc123',
        'Updated content'
      );

      expect(mockClient.to).toHaveBeenCalledWith('doc123');
      expect(mockClient.emit).toHaveBeenCalledWith('documentUpdated', {
        content: 'Updated content',
      });
      expect(documentStateService.saveToDatabase).toHaveBeenCalledWith(
        'doc123'
      );
    });

    it('should handle errors and emit error event', async () => {
      const mockClient = {
        handshake: {
          user: { discordId: '123456789' },
        },
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const data = { docId: 'doc123', content: 'Updated content' };
      const error = new Error('Update error');

      (
        documentStateService.updateDocumentState as jest.Mock
      ).mockRejectedValueOnce(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await gateway.handleUpdateDocument(mockClient, data);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'An error occurred while updating the document.',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in handleUpdateDocument:',
        error
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
