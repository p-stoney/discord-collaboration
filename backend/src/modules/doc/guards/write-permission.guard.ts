import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PermissionsService } from '../services/permissions.service';
import { DocumentPermission } from '../enums/doc-permission.enum';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@Injectable()
export class WritePermissionGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const docId = request.params.docId;

    const hasPermission = await this.permissionsService.hasPermission(
      docId,
      user.discordId,
      DocumentPermission.WRITE
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have write access to this document.'
      );
    }

    return true;
  }
}
