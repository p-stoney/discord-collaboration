import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserRepository } from './user.repository';
import { User, UserDocument } from '../schemas/user.schema';
import { mockUsers, mockUserModel } from '../__mocks__/user.mocks';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    repository = moduleRef.get<UserRepository>(UserRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUsers),
      });

      const result = await repository.findAll();

      expect(result).toBe(mockUsers);
      expect(mockUserModel.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByDiscordId', () => {
    it('should return a user with provided discordId', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUsers[0]),
      });

      const result = await repository.findByDiscordId('12345678901234567');

      expect(result).toBe(mockUsers[0]);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        discordId: '12345678901234567',
      });
    });

    it('should return null if user does not exist', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      const result = await repository.findByDiscordId('nonexistent');

      expect(result).toBeNull();
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        discordId: 'nonexistent',
      });
    });
  });

  describe('upsert', () => {
    it('should create a new user if one does not exist', async () => {
      const newUser = {
        discordId: '99999999999999999',
        username: 'newUser',
        discriminator: '9999',
        avatar: null,
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      } as UserDocument;

      mockUserModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(newUser),
      });

      const result = await repository.upsert(newUser);

      expect(result).toBe(newUser);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { discordId: newUser.discordId },
        { $set: newUser },
        { new: true, upsert: true }
      );
    });

    it('should update an existing user', async () => {
      const updatedUser = { ...mockUsers[0], username: 'updatedName' };

      mockUserModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(updatedUser),
      });

      const result = await repository.upsert(updatedUser);

      expect(result).toBe(updatedUser);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { discordId: updatedUser.discordId },
        { $set: updatedUser },
        { new: true, upsert: true }
      );
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const discordId = mockUsers[0].discordId;
      const updateUserDto = { username: 'updatedUser' };

      const updatedUser = { ...mockUsers[0], ...updateUserDto };

      mockUserModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(updatedUser),
      });

      const result = await repository.update(discordId, updateUserDto);

      expect(result).toBe(updatedUser);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { discordId },
        { $set: updateUserDto },
        { new: true }
      );
    });

    it('should return null if user does not exist', async () => {
      const discordId = 'nonexistent';
      const updateUserDto = { username: 'updatedUser' };

      mockUserModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      const result = await repository.update(discordId, updateUserDto);

      expect(result).toBeNull();
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { discordId },
        { $set: updateUserDto },
        { new: true }
      );
    });
  });
});
