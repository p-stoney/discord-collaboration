import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticatedGuard } from './authenticated.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

describe('AuthenticatedGuard', () => {
  let guard: AuthenticatedGuard;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [AuthenticatedGuard],
    }).compile();

    guard = moduleRef.get<AuthenticatedGuard>(AuthenticatedGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if user is authenticated', () => {
      const request = {
        isAuthenticated: jest.fn().mockReturnValue(true),
      } as unknown as AuthenticatedRequest;

      const context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.isAuthenticated).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not authenticated', () => {
      const request = {
        isAuthenticated: jest.fn().mockReturnValue(false),
      } as unknown as AuthenticatedRequest;

      const context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(request.isAuthenticated).toHaveBeenCalled();
    });
  });
});
