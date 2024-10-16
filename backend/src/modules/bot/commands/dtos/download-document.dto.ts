import { Param, ParamType } from '@discord-nestjs/core';

export class DownloadDocumentDto {
  @Param({
    description: 'The document ID to download',
    required: true,
    type: ParamType.STRING,
  })
  docId: string;
}
