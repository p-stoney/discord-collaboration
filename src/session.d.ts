import 'express-session';

/**
 * Extends the Express session data to include user and state properties for Discord OAuth2.
 */
declare module 'express-session' {
  interface SessionData {
    user: string | null;
    state?: string;
  }
}
