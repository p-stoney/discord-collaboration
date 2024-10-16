import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Profile as DiscordProfile } from 'passport-discord';

export class AuthUserDto {
  @IsObject()
  @IsNotEmpty()
  profile: DiscordProfile;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
