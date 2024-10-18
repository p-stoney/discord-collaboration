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
import { AuthenticatedRequest } from './interfaces/extended-request';
import { AuthenticatedGuard } from './guards';
import { DiscordAuthGuard } from './guards';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  @Get('discord/start')
  startDiscordAuth(
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    req.session.state = state;
    res.redirect('/auth/discord/login');
  }

  @Get('discord/login')
  @UseGuards(DiscordAuthGuard)
  discordLogin() {}

  @Get('callback')
  @UseGuards(DiscordAuthGuard)
  async handleDiscordCallback() {
    console.log('Successfully authenticated with Discord');
  }

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
