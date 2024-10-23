import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { Request, Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('AuthController', () => {
  let controller: AuthController;

  class MockThrottlerGuard {
    canActivate() {
      return true;
    }
  }

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .overrideGuard(ThrottlerGuard)
      .useClass(MockThrottlerGuard)
      .compile();

    controller = moduleRef.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('startDiscordAuth', () => {
    it('should set state in session and redirect to /auth/discord/login', () => {
      const state = 'someRandomState';
      const req = {
        session: {},
      } as Request;

      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      controller.startDiscordAuth(state, req, res);

      expect(req.session.state).toBe(state);
      expect(res.redirect).toHaveBeenCalledWith('/auth/discord/login');
    });
  });
});
