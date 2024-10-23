import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { DocDto } from './doc.dto';

export class UpdateDocDetailsDto extends PartialType(DocDto) {}

export class UpdateDocDto {
  @IsString()
  @IsNotEmpty()
  docId: string;

  @ValidateNested()
  @Type(() => UpdateDocDetailsDto)
  updatedDetails: UpdateDocDetailsDto;
}
