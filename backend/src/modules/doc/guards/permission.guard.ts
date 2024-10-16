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
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService
  ) {}

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
