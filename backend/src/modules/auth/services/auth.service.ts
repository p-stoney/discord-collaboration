import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { UserDocument } from '../../user/schemas/user.schema';
import { AuthUserDto, UserDto } from '../../user/dtos';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser({
    profile,
    accessToken,
    refreshToken,
  }: AuthUserDto): Promise<UserDocument> {
    const { id: discordId, username, discriminator, avatar, email } = profile;

    const userDto: UserDto = {
      discordId,
      username,
      discriminator,
      avatar,
      email,
      accessToken,
      refreshToken,
    };

    return this.userService.upsert(userDto);
  }

  async findByDiscordId(discordId: string): Promise<UserDocument | null> {
    return this.userService.findByDiscordId(discordId);
  }
}
