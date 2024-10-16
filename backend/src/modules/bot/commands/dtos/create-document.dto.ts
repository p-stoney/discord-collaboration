import { Param, ParamType } from '@discord-nestjs/core';

export class CreateDocumentDto {
  @Param({
    description: 'The title of the document',
    required: true,
    type: ParamType.STRING,
    minLength: 1,
    maxLength: 100,
  })
  title: string;
}
