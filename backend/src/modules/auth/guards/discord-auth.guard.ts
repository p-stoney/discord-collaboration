import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../interfaces/authenticated.interface';

/**
 * Guard that initiates the Discord OAuth authentication process.
 */
@Injectable()
export class DiscordAuthGuard extends AuthGuard('discord') {
  /**
   * Overrides the default `canActivate` method to handle session login.
   * @param context - The current execution context.
   * @returns A boolean indicating if the activation is successful.
   */
  async canActivate(context: ExecutionContext) {
    const activate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    await super.logIn(request);
    return activate;
  }
}
