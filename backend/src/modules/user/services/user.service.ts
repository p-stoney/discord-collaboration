import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserDocument } from '../schemas/user.schema';
import { UserDto, UpdateUserDto } from '../dtos';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  /**
   * Upserts a user in the database.
   * @param userDto - The user data to upsert.
   * @returns The upserted user.
   * @throws NotFoundException if the user does not exist.
   * @throws Error if the upsert fails.
   */
  async upsert(userDto: UserDto): Promise<UserDocument> {
    return this.repository.upsert(userDto);
  }

  /**
   * Updates a user in the database.
   * @param discordId - The Discord ID of the user to update.
   * @param updateUserDto - The updated user data.
   * @returns The updated user.
   * @throws NotFoundException if the user does not exist.
   */
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

  /**
   * Finds a user by their Discord ID.
   * @param discordId - The Discord ID of the user.
   * @returns The user if found.
   * @throws NotFoundException if the user does not exist.
   */
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
