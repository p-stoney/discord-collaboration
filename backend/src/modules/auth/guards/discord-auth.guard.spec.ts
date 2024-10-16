import { Test, TestingModule } from '@nestjs/testing';
import { DiscordAuthGuard } from './discord-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

describe('DiscordAuthGuard', () => {
  let guard: DiscordAuthGuard;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [DiscordAuthGuard],
    }).compile();

    guard = moduleRef.get<DiscordAuthGuard>(DiscordAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let context: ExecutionContext;
    let request: AuthenticatedRequest;

    beforeEach(() => {
      request = {} as AuthenticatedRequest;

      context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      });
    });

    it('should return true if authentication is successful', async () => {
      jest
        .spyOn(AuthGuard('discord').prototype, 'canActivate')
        .mockResolvedValueOnce(true);

      jest
        .spyOn(AuthGuard('discord').prototype, 'logIn')
        .mockImplementationOnce(() => Promise.resolve());

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(AuthGuard('discord').prototype.canActivate).toHaveBeenCalledWith(
        context
      );
      expect(AuthGuard('discord').prototype.logIn).toHaveBeenCalledWith(
        request
      );
    });

    it('should throw an error if logIn fails', async () => {
      jest
        .spyOn(AuthGuard('discord').prototype, 'canActivate')
        .mockResolvedValueOnce(true);

      const error = new Error('LogIn Failed');
      jest
        .spyOn(AuthGuard('discord').prototype, 'logIn')
        .mockRejectedValueOnce(error);

      await expect(guard.canActivate(context)).rejects.toThrow(error);

      expect(AuthGuard('discord').prototype.canActivate).toHaveBeenCalledWith(
        context
      );
      expect(AuthGuard('discord').prototype.logIn).toHaveBeenCalledWith(
        request
      );
    });
  });
});
