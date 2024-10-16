import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);

export const WsGetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<Socket>();
    const user = client.data.user;
    return data ? user?.[data] : user;
  }
);
