import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';

import { UsersService } from '@/users/providers/users.service';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshToken } from '../refresh-token.entity';

@Injectable()
export class RefreshTokensProvider {
  constructor(
    // Inject jwt service
    private readonly jwtService: JwtService,

    // Inject jwt configuration
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    // Inject UsersService
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    // Inject provider
    private readonly generateTokensProvider: GenerateTokensProvider,

    // Inject refresh token
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  public async refreshTokens(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh Token is required');
    }

    let activeUser: Pick<ActiveUserData, 'sub'>;

    // Verify the refreshToken using jwt service
    try {
      activeUser = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(oldRefreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });
    } catch (error) {
      console.log(error);

      throw new UnauthorizedException('Invalid or expired Refresh Token');
    }

    // Check Token Revoked
    const dbToken = await this.refreshTokenRepository.findOne({
      where: { token: oldRefreshToken },
    });

    if (dbToken) {
      if (dbToken.isRevoked || dbToken.expiresAt < new Date()) {
        await this.refreshTokenRepository.remove(dbToken);
        throw new UnauthorizedException(
          'Refresh Token has been revoked or expired.',
        );
      }
    }

    // Fetch the user from the database
    const user = await this.usersService.findOneById(activeUser.sub);

    if (!user) {
      throw new UnauthorizedException('User not found of invalid token');
    }

    // Generate the tokens
    const accessToken =
      await this.generateTokensProvider.generateAccessToken(user);

    return { accessToken, user };
  }
}
