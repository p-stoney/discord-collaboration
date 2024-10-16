import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { UserDocument } from '../../user/schemas/user.schema';

export type Done<UserType> = (err: unknown, user?: UserType | null) => void;

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  serializeUser(user: UserDocument, done: Done<string>) {
    done(null, user.discordId);
  }

  async deserializeUser(discordId: string, done: Done<UserDocument>) {
    const userDB = await this.authService.findByDiscordId(discordId);
    return done(null, userDB || null);
  }
}
