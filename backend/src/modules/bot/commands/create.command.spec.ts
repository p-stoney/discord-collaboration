import { CreateCommand } from './create.command';
import { DocService } from '../../doc/services/doc.service';
import { CommandInteraction, User } from 'discord.js';
import { CreateDocumentDto } from './dtos/create-document.dto';

describe('CreateCommand', () => {
  let command: CreateCommand;
  let docService: DocService;

  const mockDocService = {
    create: jest.fn(),
  };

  const mockInteraction = {
    user: {
      id: '123456789012345678',
    } as User,
    reply: jest.fn(),
  } as unknown as CommandInteraction;

  beforeEach(() => {
    docService = mockDocService as unknown as DocService;
    command = new CreateCommand(docService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onCreateDocument', () => {
    it('should create a document and send a confirmation message', async () => {
      const discordId = mockInteraction.user.id;
      const dto: CreateDocumentDto = {
        title: 'Test Document',
      };

      mockDocService.create.mockResolvedValueOnce(null);

      await command.onCreateDocument(dto, mockInteraction);

      expect(docService.create).toHaveBeenCalledWith({
        ownerId: discordId,
        title: dto.title,
        content: '',
      });

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: `Document "${dto.title}" created successfully.`,
        ephemeral: true,
      });
    });
  });
});
