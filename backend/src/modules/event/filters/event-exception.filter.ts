import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch()
export class EventExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient<Socket>();
    const errorMessage = exception.message || 'An error occurred';

    client.emit('error', { message: errorMessage });
  }
}
