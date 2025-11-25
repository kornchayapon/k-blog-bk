import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';

import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { User } from '@/users/user.entity';
import { UserRole } from '../enums/user.role.enum';
import { RefreshToken } from '../refresh-token.entity';

@Injectable()
export class GenerateTokensProvider {
  constructor(
    // Inject service
    private readonly jwtService: JwtService,

    // Inject jwt configuration
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  public async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  public async generateAccessToken(user: User) {
    return await this.signToken<Partial<ActiveUserData>>(
      user.id,
      this.jwtConfiguration.accessTokenTtl,
      { email: user.email, role: user.role as UserRole },
    );
  }

  public async generateAllTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { email: user.email, role: user.role as UserRole },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
    ]);

    const expiresAt = new Date(
      Date.now() + this.jwtConfiguration.refreshTokenTtl * 1000, // 24 hrs
    );

    // write refresh token to DB
    const newRefreshToken = this.refreshTokenRepository.create({
      token: refreshToken,
      expiresAt,
      user,
    });

    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
