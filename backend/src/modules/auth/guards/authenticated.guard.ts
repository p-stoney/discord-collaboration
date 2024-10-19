import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthenticatedRequest,
  AuthenticatedSocket,
} from '../interfaces/authenticated.interface';

/**
 * Guard that checks if the user is authenticated for HTTP requests.
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  /**
   * Determines if the current request has an authenticated user.
   * @param context - The current execution context.
   * @returns `true` if the user is authenticated, otherwise throws an `UnauthorizedException`.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.isAuthenticated()) {
      return true;
    } else {
      throw new UnauthorizedException('User is not authenticated');
    }
  }
}

/**
 * Guard that checks if the user is authenticated for WebSocket connections.
 */
@Injectable()
export class WsAuthenticatedGuard implements CanActivate {
  /**
   * Determines if the current WebSocket client has an authenticated user.
   * @param context - The current execution context.
   * @returns `true` if the user is authenticated, otherwise throws an `UnauthorizedException`.
   */
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
