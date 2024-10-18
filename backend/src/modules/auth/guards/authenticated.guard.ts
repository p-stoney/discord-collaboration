import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthenticatedRequest,
  AuthenticatedSocket,
} from '../interfaces/extended-request';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.isAuthenticated()) {
      return true;
    } else {
      throw new UnauthorizedException('User is not authenticated');
    }
  }
}

@Injectable()
export class WsAuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: AuthenticatedSocket = context
      .switchToWs()
      .getClient<AuthenticatedSocket>();
    const user = client.handshake.user;

    if (user) {
      return true;
    } else {
      throw new UnauthorizedException('User is not authenticated');
    }
  }
}
