import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../services/permissions.service';
import { DocumentPermission } from '../enums/doc-permission.enum';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import {
  AuthenticatedRequest,
  AuthenticatedSocket,
} from '../../auth/interfaces/authenticated.interface';

/**
 * Guard that checks if the user has the required permission for a document in HTTP requests.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService
  ) {}

  /**
   * Determines if the user has the required document permission.
   * @param context - The current execution context.
   * @returns `true` if the user has permission, otherwise throws a `ForbiddenException`.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<DocumentPermission>(
      PERMISSION_KEY,
      context.getHandler()
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const docId = request.params.docId;

    const hasPermission = await this.permissionsService.hasPermission(
      docId,
      user.discordId,
      requiredPermission
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `You do not have ${requiredPermission.toLowerCase()} access to this document.`
      );
    }

    return true;
  }
}

/**
 * Guard that checks if the user has the required permission for a document in WebSocket events.
 */
@Injectable()
export class WsPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService
  ) {}

  /**
   * Determines if the WebSocket client has the required document permission.
   * @param context - The current execution context.
   * @returns `true` if the user has permission, otherwise throws a `ForbiddenException`.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<DocumentPermission>(
      PERMISSION_KEY,
      context.getHandler()
    );

    if (!requiredPermission) {
      return true;
    }

    const client: AuthenticatedSocket = context
      .switchToWs()
      .getClient<AuthenticatedSocket>();
    const user = client.handshake.user;
    const data = context.switchToWs().getData();
    const docId = data.docId;

    const hasPermission = await this.permissionsService.hasPermission(
      docId,
      user.discordId,
      requiredPermission
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `You do not have ${requiredPermission.toLowerCase()} access to this document.`
      );
    }

    return true;
  }
}
