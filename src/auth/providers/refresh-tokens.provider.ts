import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';

import { UsersService } from '@/users/providers/users.service';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

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
  ) {}

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    // Verify the refreshToken using jwt service
    try {
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      //Fetch the user from the database
      const user = await this.usersService.findOneById(sub);

      if (!user) {
        throw new UnauthorizedException('User not found of invalid token');
      }

      // Generate the tokens
      return await this.generateTokensProvider.generateAccessToken(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
