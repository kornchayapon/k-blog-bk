import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { CreateUserProvider } from './create-user.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    // Inject Provider
    private readonly createUserProvider: CreateUserProvider,
  ) {}

  // Create User
  public async create(createUserDto: CreateUserDto) {
    return await this.createUserProvider.createUser(createUserDto);
  }

  // Find all users
  public async findAll() {
    let users: User[];

    try {
      users = await this.usersRepository.find();
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connection to database',
        },
      );
    }

    return users;
  }

  // Find user by ID
  public async findOneById(id: number) {
    if (!id) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return await this.usersRepository.findOneBy({ id });
  }

  // Find one user by email
  public async findOneByEmail(email: string) {
    if (!email) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return await this.usersRepository.findOneBy({ email });
  }

  // Update user
  public async update(updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({
      id: updateUserDto.id,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);

    return await this.usersRepository.save(user);
  }

  // Delete user
  public async delete(id: number) {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.usersRepository.delete(id);
  }

  // Soft delete user
  public async softDelete(id: number) {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.usersRepository.softDelete(id);
  }

  // Restore user
  public async restore(id: number) {
    return await this.usersRepository.restore(id);
  }
}
