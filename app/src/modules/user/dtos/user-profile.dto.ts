import { IsEmail, IsString, IsOptional, Length } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class UserProfileDto {
  @IsString()
  @Length(17, 19)
  @Expose()
  discordId: string;

  @IsString()
  @Length(2, 32)
  @Expose()
  username: string;

  @IsString()
  @Length(4)
  @Expose()
  discriminator: string;

  @IsOptional()
  @IsString()
  @Expose()
  avatar: string | null;

  @IsOptional()
  @IsEmail()
  @Expose()
  email?: string;

  @Exclude()
  accessToken: string;

  @Exclude()
  refreshToken: string;
}

export class UpdateUserProfileDto extends PartialType(UserProfileDto) {}
