import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { UserDocument } from '../../user/schemas/user.schema';
import { AuthUserDto, UserDto } from '../../user/dtos';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  /**
   * Validate the user and upsert the user in the database
   * @param profile - Discord profile
   * @param accessToken - Discord access token
   * @param refreshToken - Discord refresh token
   * @returns User document
   * @throws Error if user is not created
   * @throws Error if user is not updated
   */
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

  /**
   * Find a user by Discord ID
   * @param discordId - Discord ID
   * @returns User document or null
   * @throws Error if user is not found by Discord ID
   */
  async findByDiscordId(discordId: string): Promise<UserDocument | null> {
    return this.userService.findByDiscordId(discordId);
  }
}
