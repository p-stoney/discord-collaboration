import { Request } from 'express';
import { UserDocument } from '../../user/schemas/user.schema';
import { Session, SessionData } from 'express-session';
import { Socket } from 'socket.io';

export interface AuthenticatedRequest extends Request {
  user: UserDocument;
  session: Session & Partial<SessionData>;
}

export interface AuthenticatedSocket extends Socket {
  handshake: Socket['handshake'] & {
    user: UserDocument;
    session: Session & Partial<SessionData>;
  };
}
