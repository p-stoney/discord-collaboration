import 'socket.io';
import { UserDocument } from './modules/user/schemas/user.schema';
import { Session } from 'express-session';

declare module 'socket.io' {
  interface Handshake {
    user: UserDocument;
    session: Session & Partial<SessionData>;
  }
}
