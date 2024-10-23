import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Exception filter that handles unauthorized exceptions and redirects or responds accordingly.
 */
@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
  /**
   * Handles `UnauthorizedException` by redirecting or sending an appropriate response.
   * @param exception - The caught `UnauthorizedException`.
   * @param host - The current execution context.
   */
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (request.url.includes('/auth/callback')) {
      response.redirect('/auth/discord/login?error=InvalidState');
    } else if (request.url.startsWith('/api')) {
      response.status(401).json({
        statusCode: 401,
        message: 'Unauthorized',
      });
    } else {
      response.redirect('/auth/login?error=Unauthorized');
    }
  }
}
