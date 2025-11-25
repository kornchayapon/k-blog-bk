import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import jwtConfig from './config/jwt.config';

import { SignInProvider } from './providers/sign-in.provider';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';

import { AuthService } from './providers/auth.service';
import { AuthController } from './auth.controller';

import { UsersModule } from '@/users/users.module';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token.entity';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    SignInProvider,
    GenerateTokensProvider,
    RefreshTokensProvider,
    { provide: HashingProvider, useClass: BcryptProvider },
  ],
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
