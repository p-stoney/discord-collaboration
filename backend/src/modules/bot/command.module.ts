import { Module } from '@nestjs/common';
import { ReflectMetadataProvider } from '@discord-nestjs/core';
import { DocModule } from '../doc/doc.module';
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
  imports: [DocModule],
  providers: [
    ReflectMetadataProvider,
    CreateCommand,
    DownloadCommand,
    ListCommand,
    HelpCommand,
    OpenCommand,
    RegisterCommand,
    ShareCommand,
  ],
})
export class CommandsModule {}
