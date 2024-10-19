import {
  Controller,
  Get,
  Req,
  Res,
  Query,
  UseGuards,
  Post,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from './interfaces/authenticated.interface';
import { AuthenticatedGuard } from './guards';
import { DiscordAuthGuard } from './guards';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Controller responsible for handling authentication routes using Discord OAuth2.
 */
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  /**
   * Initiates the Discord OAuth2 authentication process.
   * Stores the `state` parameter in the session for security and redirects to the Discord login route.
   * @param state - An optional state parameter for OAuth2 security.
   * @param req - The incoming request object.
   * @param res - The response object to redirect the user.
   */
  @Get('discord/start')
  startDiscordAuth(
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    req.session.state = state;
    res.redirect('/auth/discord/login');
  }

  /**
   * Endpoint that triggers the Discord OAuth2 login.
   * The actual authentication is handled by the `DiscordAuthGuard`.
   */
  @Get('discord/login')
  @UseGuards(DiscordAuthGuard)
  discordLogin() {}

  /**
   * Callback endpoint for Discord OAuth2 authentication.
   * Invoked after the user authorizes the application on Discord.
   * The guard processes the user information and establishes a session.
   */
  @Get('callback')
  @UseGuards(DiscordAuthGuard)
  async handleDiscordCallback() {
    console.log('Successfully authenticated with Discord');
  }

  /**
   * Logs out the authenticated user by terminating the session and redirecting.
   * @param req - The authenticated request containing the user session.
   * @param res - The response object to send the logout confirmation.
   */
  @Post('logout')
  @UseGuards(AuthenticatedGuard)
  logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    req.logout((err: Error | null) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      req.session.destroy(() => {
        res.redirect('/auth/discord/login?message=LoggedOut');
      });
    });
  }
}
