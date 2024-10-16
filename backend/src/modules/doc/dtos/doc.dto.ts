import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CollaboratorDto } from './collaborator.dto';

export class DocDto {
  @IsString()
  @IsNotEmpty()
  docId: string;

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

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  revision: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollaboratorDto)
  collaborators?: CollaboratorDto[];
}
