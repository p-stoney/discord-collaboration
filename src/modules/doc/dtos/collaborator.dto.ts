import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { DocumentPermission } from '../enums/doc-permission.enum';

export class CollaboratorDto {
  @IsString()
  @IsNotEmpty()
  @Length(17, 19)
  discordId: string;

  @IsEnum(DocumentPermission)
  @IsNotEmpty()
  permission: DocumentPermission;
}
