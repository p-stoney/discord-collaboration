import { UserDocument } from '../schemas/user.schema';

export const mockUsers = [
  {
    discordId: '12345678901234567',
    username: 'test',
    discriminator: '1234',
    avatar: null,
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
  },
  {
    discordId: '12345678901234568',
    username: 'test2',
    discriminator: '1231',
    avatar: null,
    accessToken: 'accessToken1',
    refreshToken: 'refreshToken1',
  },
] as UserDocument[];

export const mockUserModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

export const mockUserRepository = {
  upsert: jest.fn(),
  update: jest.fn(),
  findByDiscordId: jest.fn(),
  findAll: jest.fn(),
};

export const mockUserService = {
  findByDiscordId: jest.fn(),
  update: jest.fn(),
};

export const mockUserDecorator = () => {
  return () => {
    return mockUsers[0];
  };
};
