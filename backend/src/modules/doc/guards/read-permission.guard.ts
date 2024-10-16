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
export class ReadPermissionGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const docId = request.params.docId;

    const hasPermission = await this.permissionsService.hasPermission(
      docId,
      user.discordId,
      DocumentPermission.READ
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have read access to this document.'
      );
    }

    return true;
  }
}
