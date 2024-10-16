import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface HttpErrorResponse extends HttpException {
  title: string;
  detail: string;
  errors: { message: string }[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpErrorResponse, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(exception.getResponse() as HttpErrorResponse),
    });
  }
}
