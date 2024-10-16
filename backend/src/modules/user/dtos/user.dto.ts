import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @Length(17, 19)
  discordId: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 32)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(4)
  discriminator: string;

  @IsOptional()
  @IsString()
  avatar: string | null;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class UpdateUserDto extends PartialType(UserDto) {}
