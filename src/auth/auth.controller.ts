import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';

import { AuthService } from './providers/auth.service';
import { SignInDto } from './dtos/signin.dto';

import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';

import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';

enum TokenType {
  Access,
  Refresh,
  All,
}

@Controller('auth')
export class AuthController {
  constructor(
    // Inject service
    private readonly authService: AuthService,

    // Inject jwt configuration
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  // Set cookie helper function
  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    tokenType: TokenType,
  ) {
    if (tokenType == TokenType.Access || tokenType == TokenType.All) {
      // set access token httpOnly = false, for read from nextjs
      res.cookie('accessToken', accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: this.jwtConfiguration.accessTokenTtl,
        path: '/',
      });
    }

    if (tokenType == TokenType.Refresh || tokenType == TokenType.All) {
      // set refresh token httpOnly = true for security
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: this.jwtConfiguration.refreshTokenTtl,
        path: '/',
      });
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.signIn(signInDto);

    this.setTokenCookies(res, accessToken, refreshToken, TokenType.All);

    return process.env.NODE_ENV === 'production'
      ? { user }
      : { access_token: accessToken, refresh_token: refreshToken, user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const oldRefreshToken = req.cookies['refreshToken'];

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh Token is missing or invalid.');
    }

    try {
      const { accessToken, user } =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.authService.refreshTokens(oldRefreshToken);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.setTokenCookies(res, accessToken, oldRefreshToken, TokenType.Access);

      return process.env.NODE_ENV === 'production'
        ? { message: 'Tokens refreshed successfully' }
        : // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          { access_token: accessToken, refresh_token: oldRefreshToken, user };
    } catch (error) {
      // refresh failed delete all cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async logout(
    @Req() req: Request,
    // @Res({ passthrough: true }) res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const oldRefreshToken = req.cookies['refreshToken'];

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh Token is missing or invalid.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await this.authService.logout(oldRefreshToken);
  }
}
