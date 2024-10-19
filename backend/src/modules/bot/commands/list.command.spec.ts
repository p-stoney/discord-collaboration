import { ListCommand } from './list.command';
import { DocService } from '../../doc/services';
import { CommandInteraction, User } from 'discord.js';
import { DocDto } from '../../doc/dtos/doc.dto';

describe('ListDocumentsCommand', () => {
  let command: ListCommand;
  let docService: DocService;

  const mockDocService = {
    findAllByCollaborator: jest.fn(),
  };

  const mockInteraction = {
    user: {
      id: '123456789012345678',
    } as User,
    reply: jest.fn(),
  } as unknown as CommandInteraction;

  beforeEach(() => {
    docService = mockDocService as unknown as DocService;
    command = new ListCommand(docService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onListDocuments', () => {
    it('should list documents and send them to the user', async () => {
      const discordId = mockInteraction.user.id;
      const documents: DocDto[] = [
        { docId: '1', title: 'Document 1' } as DocDto,
        { docId: '2', title: 'Document 2' } as DocDto,
      ];

      mockDocService.findAllByCollaborator.mockResolvedValueOnce(documents);

      await command.onListDocuments(mockInteraction);

      const expectedContent = `Here are your documents:\n1 : Document 1\n2 : Document 2`;

      expect(docService.findAllByCollaborator).toHaveBeenCalledWith(discordId);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: expectedContent,
        ephemeral: true,
      });
    });

    it('should inform the user if no documents are found', async () => {
      const discordId = mockInteraction.user.id;
      const documents: DocDto[] = [];

      mockDocService.findAllByCollaborator.mockResolvedValueOnce(documents);

      await command.onListDocuments(mockInteraction);

      const expectedContent = `Here are your documents:\nNo documents found.`;

      expect(docService.findAllByCollaborator).toHaveBeenCalledWith(discordId);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: expectedContent,
        ephemeral: true,
      });
    });
  });
});
