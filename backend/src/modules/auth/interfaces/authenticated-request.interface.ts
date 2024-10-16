import { Request } from 'express';
import { UserDocument } from '../../../modules/user/schemas/user.schema';

export interface AuthenticatedRequest extends Request {
  user: UserDocument;
  state: string;
}
