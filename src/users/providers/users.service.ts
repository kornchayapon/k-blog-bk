import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Create User
  public async createUser(createUserDto: CreateUserDto) {
    let user = this.usersRepository.create(createUserDto);

    try {
      user = await this.usersRepository.save(user);
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connection to database',
        },
      );
    }

    return user;
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
    if (!id) return null;
    return await this.usersRepository.findOneBy({ id });
  }

  // Find one user by email
  public async findOneByEmail(email: string) {
    if (!email) return null;
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
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.usersRepository.delete(user);
  }

  // Soft delete user
  public async softDelete(id: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.usersRepository.softDelete(id);
  }
}
