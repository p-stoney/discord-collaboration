import { Param, Choice, ParamType } from '@discord-nestjs/core';
import { DocumentPermission } from '../../../doc/enums/doc-permission.enum';

export class ShareDocumentDto {
  @Param({
    description: 'The document ID to share',
    required: true,
    type: ParamType.STRING,
  })
  docId: string;

  @Param({
    description: 'Users to share the document with',
    required: true,
    type: ParamType.USER,
  })
  users: string[];

  @Choice(DocumentPermission)
  @Param({
    description: 'Permission level (READ, WRITE, ADMIN)',
    required: true,
    type: ParamType.STRING,
  })
  permission: DocumentPermission;
}
