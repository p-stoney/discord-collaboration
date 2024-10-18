import { Test, TestingModule } from '@nestjs/testing';
import { PermissionGuard } from './permission.guard';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../services/permissions.service';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DocumentPermission } from '../enums/doc-permission.enum';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { createMock } from '@golevelup/ts-jest';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let permissionsService: PermissionsService;

  const mockPermissionsService = {
    hasPermission: jest.fn(),
  };

  const mockReflector = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    guard = moduleRef.get<PermissionGuard>(PermissionGuard);
    reflector = moduleRef.get<Reflector>(Reflector);
    permissionsService = moduleRef.get<PermissionsService>(PermissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const mockContext = createMock<ExecutionContext>();

    const mockRequest = {
      user: {
        discordId: '11111111111111111',
      },
      params: {
        docId: 'doc123',
      },
    } as unknown as AuthenticatedRequest;

    beforeEach(() => {
      mockContext.switchToHttp.mockReturnValue({
        getRequest: <T = AuthenticatedRequest>(): T => mockRequest as T,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      });
    });

    it('should return true if no required permission is set', async () => {
      mockReflector.get.mockReturnValueOnce(undefined);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(
        PERMISSION_KEY,
        expect.any(Function)
      );
    });

    it('should return true if user has required permission', async () => {
      const requiredPermission = DocumentPermission.WRITE;

      mockReflector.get.mockReturnValueOnce(requiredPermission);
      mockPermissionsService.hasPermission.mockResolvedValueOnce(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(
        PERMISSION_KEY,
        expect.any(Function)
      );
      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        mockRequest.params.docId,
        mockRequest.user.discordId,
        requiredPermission
      );
    });

    it('should throw ForbiddenException if user lacks required permission', async () => {
      const requiredPermission = DocumentPermission.ADMIN;

      mockReflector.get.mockReturnValueOnce(requiredPermission);
      mockPermissionsService.hasPermission.mockResolvedValueOnce(false);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException
      );

      expect(reflector.get).toHaveBeenCalledWith(
        PERMISSION_KEY,
        expect.any(Function)
      );
      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        mockRequest.params.docId,
        mockRequest.user.discordId,
        requiredPermission
      );
    });

    it('should throw ForbiddenException if hasPermission throws an error', async () => {
      const requiredPermission = DocumentPermission.WRITE;

      mockReflector.get.mockReturnValueOnce(requiredPermission);
      mockPermissionsService.hasPermission.mockRejectedValueOnce(
        new ForbiddenException(
          `You do not have ${requiredPermission.toLowerCase()} access to this document.`
        )
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException
      );

      expect(reflector.get).toHaveBeenCalledWith(
        PERMISSION_KEY,
        expect.any(Function)
      );
      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        mockRequest.params.docId,
        mockRequest.user.discordId,
        requiredPermission
      );
    });
  });
});
