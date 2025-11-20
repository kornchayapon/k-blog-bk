import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

// Configuration
import { ConfigModule, ConfigService } from '@nestjs/config';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import environmentValidation from './config/environment.validation';

// Database
import { TypeOrmModule } from '@nestjs/typeorm';

import cloudinaryConfig from './config/cloudinary.config';
import jwtConfig from './auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';

import { TagsModule } from './tags/tags.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { PostTypesModule } from './post-types/post-types.module';
import { CategoriesModule } from './categories/categories.module';
import { PicturesModule } from './pictures/pictures.module';

import { AuthenticationGuard } from './auth/guards/authentication.guards';
import { AccessTokenGuard } from './auth/guards/access-token.guard';

// Get the current NODE_ENV
const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig, cloudinaryConfig],
      validationSchema: environmentValidation,
    }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        synchronize: configService.get('database.synchronize'),
        autoLoadEntities: configService.get('database.autoLoadEntities'),
      }),
    }),
    UsersModule,
    PostsModule,
    PostTypesModule,
    PicturesModule,
    CategoriesModule,
    TagsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AccessTokenGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
})
export class AppModule {}
