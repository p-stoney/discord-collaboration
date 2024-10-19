import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Socket } from 'socket.io';

/**
 * Exception filter that handles exceptions in WebSocket events and emits error messages to the client.
 */
@Catch()
export class EventExceptionFilter implements ExceptionFilter {
  /**
   * Catches exceptions and emits an error event to the WebSocket client.
   * @param exception - The caught exception.
   * @param host - The current execution context.
   */
  catch(exception: any, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient<Socket>();
    const errorMessage = exception.message || 'An error occurred';

    client.emit('error', { message: errorMessage });
  }
}
