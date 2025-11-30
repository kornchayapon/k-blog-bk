import {
  Body,
  Controller,
  forwardRef,
  Get,
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
import type { ActiveUserData } from './interfaces/active-user-data.interface';
import { ActiveUser } from './decorators/active-user.decorator';
import { UsersService } from '@/users/providers/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    // Inject service
    private readonly authService: AuthService,

    // Inject jwt configuration
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    // Inject User service
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.signIn(signInDto);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.jwtConfiguration.refreshTokenTtl,
      path: '/',
    });

    return { access_token: accessToken, user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token is missing or invalid.');
    }

    try {
      const { accessToken } =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.authService.refreshTokens(refreshToken);

      return { access_token: accessToken };
    } catch (error) {
      // refresh failed delete all cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async logout(@Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token is missing or invalid.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await this.authService.logout(refreshToken);
  }

  @Get('profile')
  // @Auth(AuthType.None)
  public async profile(@ActiveUser() user: ActiveUserData) {
    if (!user) {
      throw new UnauthorizedException('Invalid Tokens !!!');
    }

    const foundUser = await this.usersService.findOneById(user.sub);

    if (!foundUser) {
      throw new UnauthorizedException('User not found !!!');
    }

    return {
      user: {
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        avatar: foundUser.avatar,
        mobile: foundUser.mobile,
        role: foundUser.role,
        createdAt: foundUser.createdAt,
        updatedAt: foundUser.updatedAt,
      },
    };
  }
}
