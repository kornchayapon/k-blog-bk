import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';

import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { User } from '@/users/user.entity';
import { UserRole } from '../enums/user.role.enum';

@Injectable()
export class GenerateTokensProvider {
  constructor(
    // Inject service
    private readonly jwtService: JwtService,

    // Inject jwt configuration
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
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

  public async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { email: user.email, role: user.role as UserRole },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
    ]);

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
