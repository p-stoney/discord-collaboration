import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { UserDocument } from './schemas/user.schema';
import { UserProfileDto, UpdateUserProfileDto } from './dtos';
import { plainToClass } from 'class-transformer';
import { NotFoundException } from '@nestjs/common';
import {
  mockUsers,
  mockUserService,
  mockUserDecorator,
} from './__mocks__/user.mocks';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideProvider('User')
      .useValue(mockUserDecorator)
      .compile();

    controller = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the profile of the authenticated user', () => {
      const user: UserDocument = mockUsers[0];

      const result = controller.getProfile(user);

      const expected = plainToClass(UserProfileDto, user, {
        excludeExtraneousValues: true,
      });

      expect(result).toEqual(expected);
    });
  });

  describe('updateProfile', () => {
    it('should update and return the updated profile of the authenticated user', async () => {
      const user: UserDocument = mockUsers[0];
      const updateProfileDto: UpdateUserProfileDto = {
        username: 'updatedUser',
      };
      const updatedUser = { ...user, ...updateProfileDto };

      mockUserService.update.mockResolvedValueOnce(updatedUser);

      const result = await controller.updateProfile(user, updateProfileDto);

      const expected = plainToClass(UserProfileDto, updatedUser, {
        excludeExtraneousValues: true,
      });

      expect(result).toEqual(expected);
      expect(userService.update).toHaveBeenCalledWith(
        user.discordId,
        updateProfileDto
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      const user: UserDocument = mockUsers[0];
      const updateProfileDto: UpdateUserProfileDto = {
        username: 'updatedUser',
      };

      mockUserService.update.mockRejectedValueOnce(
        new NotFoundException('User not found')
      );

      await expect(
        controller.updateProfile(user, updateProfileDto)
      ).rejects.toThrow(NotFoundException);

      expect(userService.update).toHaveBeenCalledWith(
        user.discordId,
        updateProfileDto
      );
    });
  });

  describe('getByDiscordId', () => {
    it('should return a user profile by discordId', async () => {
      const discordId = mockUsers[0].discordId;
      const user: UserDocument = mockUsers[0];

      mockUserService.findByDiscordId.mockResolvedValueOnce(user);

      const result = await controller.getByDiscordId(discordId);

      const expected = plainToClass(UserProfileDto, user, {
        excludeExtraneousValues: true,
      });

      expect(result).toEqual(expected);
      expect(userService.findByDiscordId).toHaveBeenCalledWith(discordId);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const discordId = 'nonexistent';

      mockUserService.findByDiscordId.mockRejectedValueOnce(
        new NotFoundException('User not found')
      );

      await expect(controller.getByDiscordId(discordId)).rejects.toThrow(
        NotFoundException
      );

      expect(userService.findByDiscordId).toHaveBeenCalledWith(discordId);
    });
  });
});
