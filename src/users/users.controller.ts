import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { UsersService } from './providers/users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Auth } from '@/auth/decorators/auth.decorator';
import { AuthType } from '@/auth/enums/auth-type.enum';
import { Serialize } from './interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';

@Controller('users')
@Serialize(UserDto)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Auth(AuthType.None)
  public async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @Auth(AuthType.None)
  public async getAll() {
    return await this.usersService.findAll();
  }

  @Get('/:id')
  public async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findOneById(id);
  }

  @Patch()
  public async update(@Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(updateUserDto);
  }

  @Delete()
  public async softDelete(@Query('id', ParseIntPipe) id: number) {
    await this.usersService.softDelete(id);

    return {
      softDelete: true,
      id,
    };
  }

  @Post('delete')
  public async delete(@Query('id', ParseIntPipe) id: number) {
    await this.usersService.delete(id);

    return {
      delete: true,
      id,
    };
  }

  @Post('restore')
  public async restore(@Query('id', ParseIntPipe) id: number) {
    await this.usersService.restore(id);

    return {
      restore: true,
      id,
    };
  }
}
