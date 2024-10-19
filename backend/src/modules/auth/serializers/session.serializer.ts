import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { UserDocument } from '../../user/schemas/user.schema';

export type Done<UserType> = (err: unknown, user?: UserType | null) => void;

/**
 * Serializer for Passport.js sessions, handling serialization and deserialization of users.
 */
@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * Serializes the user by storing the Discord ID in the session.
   * @param user - The user document to serialize.
   * @param done - Callback function.
   */
  serializeUser(user: UserDocument, done: Done<string>) {
    done(null, user.discordId);
  }

  /**
   * Deserializes the user by retrieving the user document from the Discord ID stored in the session.
   * @param discordId - The Discord ID from the session.
   * @param done - Callback function.
   */
  async deserializeUser(discordId: string, done: Done<UserDocument>) {
    const userDB = await this.authService.findByDiscordId(discordId);
    return done(null, userDB || null);
  }
}
