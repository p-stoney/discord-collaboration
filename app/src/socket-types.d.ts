import 'socket.io';
import { UserDocument } from './modules/user/schemas/user.schema';
import { Session } from 'express-session';

/**
 * Extends the Socket.IO Handshake to include user and session data for authentication.
 */
declare module 'socket.io' {
  interface Handshake {
    user: UserDocument;
    session: Session & Partial<SessionData>;
  }
}
