import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { ServerOptions, Server } from 'socket.io';
import { Response, RequestHandler } from 'express';
import { ServerResponse } from 'http';
import passport from 'passport';
import {
  AuthenticatedRequest,
  AuthenticatedSocket,
} from '../modules/auth/interfaces/authenticated.interface';
import cookieParser from 'cookie-parser';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

/**
 * Custom Socket.IO adapter to integrate session and authentication with WebSocket connections.
 */
export class SocketIoAdapter extends IoAdapter {
  private sessionMiddleware: RequestHandler;
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(app: INestApplicationContext, sessionMiddleware: RequestHandler) {
    super(app);
    this.sessionMiddleware = sessionMiddleware;
  }

  /**
   * Connects to Redis for pub/sub functionality in Socket.IO.
   */
  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: 'redis://localhost:6379' });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  /**
   * Creates a Socket.IO server with custom middleware to integrate sessions and authentication.
   * @param port Port number for the server.
   * @param options Optional server configurations.
   * @returns Configured Socket.IO server.
   */
  createIOServer(port: number, options?: ServerOptions): Server {
    const optionsWithPath: ServerOptions = {
      ...options,
      path: '/socket.io',
      cors: {
        origin: 'http://localhost:3000',
        credentials: true,
      },
    };

    const server: Server = super.createIOServer(port, optionsWithPath);

    server.adapter(this.adapterConstructor);

    server.use((socket: AuthenticatedSocket, next) => {
      const req = socket.request as AuthenticatedRequest;
      const res = new ServerResponse(req) as unknown as Response;

      cookieParser()(req, res, () => {
        console.log('Cookies:', req.cookies);

        this.sessionMiddleware(req, res, () => {
          if (!req.session) {
            console.log('Session not found');
            return next(new Error('Session not found'));
          }

          socket.handshake.session = req.session;

          passport.initialize()(req, res, () => {
            passport.session()(req, res, () => {
              if (req.isAuthenticated()) {
                socket.handshake.user = req.user;
                console.log('User authenticated:', req.user);
                next();
              } else {
                console.log('User not authenticated');
                next(new Error('Unauthorized'));
              }
            });
          });
        });
      });
    });

    return server;
  }
}
