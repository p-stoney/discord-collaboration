import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { UserDto, UpdateUserDto } from '../dtos';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly model: Model<UserDocument>
  ) {}

  async upsert(userDto: UserDto): Promise<UserDocument> {
    return this.model
      .findOneAndUpdate(
        { discordId: userDto.discordId },
        { $set: userDto },
        { new: true, upsert: true }
      )
      .exec();
  }

  async update(
    discordId: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserDocument> {
    return this.model
      .findOneAndUpdate({ discordId }, { $set: updateUserDto }, { new: true })
      .exec();
  }

  async findByDiscordId(discordId: string): Promise<UserDocument | null> {
    return this.model.findOne({ discordId }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.model.find().exec();
  }
}
