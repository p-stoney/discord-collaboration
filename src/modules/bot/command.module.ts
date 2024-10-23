import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { DocModule } from '../doc/doc.module';
import { ReflectMetadataProvider } from '@discord-nestjs/core';
import { BuilderService, ShareService } from './services';
import { ShareMenuCollector } from './collectors';
import {
  CreateCommand,
  DownloadCommand,
  ListCommand,
  HelpCommand,
  OpenCommand,
  RegisterCommand,
  ShareCommand,
} from './commands';

@Module({
  imports: [DocModule, DiscordModule.forFeature()],
  providers: [
    ReflectMetadataProvider,
    BuilderService,
    ShareService,
    CreateCommand,
    DownloadCommand,
    ListCommand,
    HelpCommand,
    OpenCommand,
    RegisterCommand,
    ShareCommand,
    ShareMenuCollector,
  ],
})
export class CommandsModule {}
