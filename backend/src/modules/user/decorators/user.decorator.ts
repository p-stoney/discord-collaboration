import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthenticatedRequest,
  AuthenticatedSocket,
} from '../../auth/interfaces/extended-request';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);

export const WsGetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<AuthenticatedSocket>();
    const user = client.handshake.user;
    return data ? user?.[data] : user;
  }
);
