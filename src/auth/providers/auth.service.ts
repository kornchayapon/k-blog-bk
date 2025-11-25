import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SignInDto } from '../dtos/signin.dto';
import { SignInProvider } from './sign-in.provider';
import { RefreshTokensProvider } from './refresh-tokens.provider';
import { RefreshToken } from '../refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    // Inject Provider
    private readonly signInProvider: SignInProvider,

    // Inject refresh token provider
    private readonly refreshTokensProvider: RefreshTokensProvider,

    // Inject refresh token
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  public async signIn(signInDto: SignInDto) {
    return await this.signInProvider.signIn(signInDto);
  }

  public isAuth() {
    return true;
  }

  public async refreshTokens(oldRefreshToken: string) {
    return await this.refreshTokensProvider.refreshTokens(oldRefreshToken);
  }

  public async logout(refreshToken: string) {
    try {
      await this.refreshTokenRepository.update(
        {
          token: refreshToken,
        },
        { isRevoked: true },
      );
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('User not found of invalid token');
    }

    return { message: 'Logout successful' };
  }
}
