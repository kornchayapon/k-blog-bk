import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { REQUEST_USER_KEY } from '../constants/auth.constants';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    // Inject jwt service
    private readonly jwtService: JwtService,

    // Inject jwt configuration
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract the request from the execution context
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    // Extract the token from the header
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no found');
    }

    try {
      const payload: ActiveUserData = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request[REQUEST_USER_KEY] = payload;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Token invalid');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
