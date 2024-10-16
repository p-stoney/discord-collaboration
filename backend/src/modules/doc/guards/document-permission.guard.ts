import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DocService } from '../services/doc.service';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@Injectable()
export class DocumentPermissionGuard implements CanActivate {
  constructor(private readonly service: DocService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;
    const discordId = user.discordId;
    const docId = request.params.docId;

    const document = await this.service.findByDocId(docId);

    if (!document) {
      throw new NotFoundException(`Document with ID ${docId} not found`);
    }

    const hasPermission =
      document.ownerId === discordId ||
      document.collaborators.some(
        (collaborator) => collaborator.discordId === discordId
      );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to access this document.'
      );
    }

    return true;
  }
}
