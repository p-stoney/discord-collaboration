import { Controller, Get, UseGuards, Body, Patch, Param } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards';
import { UserService } from './services/user.service';
import { User } from './decorators/user.decorator';
import { UserDocument } from './schemas/user.schema';
import { UserProfileDto, UpdateUserProfileDto } from './dtos';
import { plainToClass } from 'class-transformer';

@Controller('users')
@UseGuards(AuthenticatedGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@User() user: UserDocument): UserProfileDto {
    return plainToClass(UserProfileDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('profile')
  async updateProfile(
    @User() user: UserDocument,
    @Body() updateProfileDto: UpdateUserProfileDto
  ): Promise<UserProfileDto> {
    const updatedUser = await this.userService.update(
      user.discordId,
      updateProfileDto
    );
    return plainToClass(UserProfileDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  @Get('discord/:discordId')
  async getByDiscordId(
    @Param('discordId') discordId: string
  ): Promise<UserProfileDto> {
    const user = await this.userService.findByDiscordId(discordId);
    return plainToClass(UserProfileDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
