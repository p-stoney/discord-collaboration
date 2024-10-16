import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CollaboratorDto } from './collaborator.dto';

export class CreateDocDto {
  @IsString()
  @IsNotEmpty()
  @Length(17, 19)
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollaboratorDto)
  collaborators?: CollaboratorDto[];
}
