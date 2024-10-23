import { HelpCommand } from './help.command';
import {
  CommandInteraction,
  ApplicationCommand,
  Collection,
  Client,
} from 'discord.js';

describe('HelpCommand', () => {
  let command: HelpCommand;

  const mockInteraction = {
    client: {
      application: {
        commands: {
          cache: new Collection<string, ApplicationCommand>(),
        },
      },
    } as unknown as Client,
    guildId: '123456789012345678',
    reply: jest.fn(),
  } as unknown as CommandInteraction;

  beforeEach(() => {
    command = new HelpCommand();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onHelp', () => {
    it('should send an embed with available commands', async () => {
      const globalCommand = {
        id: 'cmd_global',
        name: 'globalcmd',
        description: 'A global command',
        guildId: null,
      } as ApplicationCommand;

      const guildCommand = {
        id: 'cmd_guild',
        name: 'guildcmd',
        description: 'A guild command',
        guildId: '123456789012345678',
      } as ApplicationCommand;

      mockInteraction.client.application.commands.cache.set(
        globalCommand.id,
        globalCommand
      );
      mockInteraction.client.application.commands.cache.set(
        guildCommand.id,
        guildCommand
      );

      await command.onHelp(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              title: 'Available Commands',
              fields: [
                {
                  name: `/${globalCommand.name}`,
                  value: globalCommand.description,
                },
                {
                  name: `/${guildCommand.name}`,
                  value: guildCommand.description,
                },
              ],
            }),
          }),
        ]),
        ephemeral: true,
      });
    });
  });
});
