import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthenticatedRequest,
  AuthenticatedSocket,
} from '../../auth/interfaces/authenticated.interface';

/**
 * Retrieves the authenticated user from the HTTP request.
 * @param data - Optional property of the user to extract.
 */
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);

/**
 * Retrieves the authenticated user from the WebSocket client.
 * @param data - Optional property of the user to extract.
 */
export const WsGetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<AuthenticatedSocket>();
    const user = client.handshake.user;
    return data ? user?.[data] : user;
  }
);
