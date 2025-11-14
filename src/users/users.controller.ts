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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  public async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  @Get()
  public async getAllUsers() {
    return await this.usersService.findAll();
  }

  @Get('/:id')
  public async getUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findOneById(id);
  }

  @Patch()
  public async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(updateUserDto);
  }

  @Delete()
  public async softDeleteUser(@Query('id', ParseIntPipe) id: number) {
    await this.usersService.softDelete(id);

    return {
      softDelete: true,
      id,
    };
  }

  @Post('delete')
  public async deleteUser(@Query('id', ParseIntPipe) id: number) {
    await this.usersService.delete(id);

    return {
      delete: true,
      id,
    };
  }

  @Post('restore')
  public async restoreUser(@Query('id', ParseIntPipe) id: number) {
    await this.usersService.restore(id);

    return {
      restore: true,
      id,
    };
  }
}
