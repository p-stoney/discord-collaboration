import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserDocument } from '../schemas/user.schema';
import { UserDto, UpdateUserDto } from '../dtos';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async upsert(userDto: UserDto): Promise<UserDocument> {
    return this.repository.upsert(userDto);
  }

  async update(
    discordId: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserDocument> {
    const updatedUser = await this.repository.update(discordId, updateUserDto);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async findByDiscordId(discordId: string): Promise<UserDocument> {
    const user = await this.repository.findByDiscordId(discordId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.repository.findAll();
  }
}
