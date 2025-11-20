import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';
import { User } from './user.entity';
import { CreateUserProvider } from './providers/create-user.provider';
import { AuthModule } from '@/auth/auth.module';

@Module({
  controllers: [UsersController],
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  providers: [UsersService, CreateUserProvider],
  exports: [UsersService],
})
export class UsersModule {}
