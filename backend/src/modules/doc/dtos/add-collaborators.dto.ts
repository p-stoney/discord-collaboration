import { IsString, IsNotEmpty, IsArray, Length, IsEnum } from 'class-validator';
import { DocumentPermission } from '../enums/doc-permission.enum';

export class AddCollaboratorsDto {
  @IsString()
  @IsNotEmpty()
  docId: string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  @Length(17, 19, { each: true })
  users: string[];

  @IsEnum(DocumentPermission)
  @IsNotEmpty()
  permission: DocumentPermission;
}
