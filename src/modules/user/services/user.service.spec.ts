import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { UserDto, UpdateUserDto } from '../dtos';
import { NotFoundException } from '@nestjs/common';
import { mockUsers, mockUserRepository } from '../__mocks__/user.mocks';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
    repository = moduleRef.get<UserRepository>(UserRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsert', () => {
    it('should call repository.upsert with correct parameters', async () => {
      const userDto: UserDto = {
        discordId: '12345678901234567',
        username: 'test',
        discriminator: '1234',
        avatar: null,
        email: 'test@example.com',
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      const expectedUser = mockUsers[0];

      mockUserRepository.upsert.mockResolvedValueOnce(expectedUser);

      const result = await service.upsert(userDto);

      expect(result).toBe(expectedUser);
      expect(repository.upsert).toHaveBeenCalledWith(userDto);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const discordId = mockUsers[0].discordId;
      const updateUserDto: UpdateUserDto = { username: 'updatedUser' };
      const updatedUser = { ...mockUsers[0], ...updateUserDto };

      mockUserRepository.update.mockResolvedValueOnce(updatedUser);

      const result = await service.update(discordId, updateUserDto);

      expect(result).toBe(updatedUser);
      expect(repository.update).toHaveBeenCalledWith(discordId, updateUserDto);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const discordId = 'nonexistent';
      const updateUserDto: UpdateUserDto = { username: 'updatedUser' };

      mockUserRepository.update.mockResolvedValueOnce(null);

      await expect(service.update(discordId, updateUserDto)).rejects.toThrow(
        NotFoundException
      );

      expect(repository.update).toHaveBeenCalledWith(discordId, updateUserDto);
    });
  });

  describe('findByDiscordId', () => {
    it('should return a user when found', async () => {
      const discordId = mockUsers[0].discordId;
      const expectedUser = mockUsers[0];

      mockUserRepository.findByDiscordId.mockResolvedValueOnce(expectedUser);

      const result = await service.findByDiscordId(discordId);

      expect(result).toBe(expectedUser);
      expect(repository.findByDiscordId).toHaveBeenCalledWith(discordId);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const discordId = 'nonexistent';

      mockUserRepository.findByDiscordId.mockResolvedValueOnce(null);

      await expect(service.findByDiscordId(discordId)).rejects.toThrow(
        NotFoundException
      );

      expect(repository.findByDiscordId).toHaveBeenCalledWith(discordId);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserRepository.findAll.mockResolvedValueOnce(mockUsers);

      const result = await service.findAll();

      expect(result).toBe(mockUsers);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
