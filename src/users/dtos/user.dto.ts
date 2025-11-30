import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  avatar: string;

  @Expose()
  mobile: string;

  @Expose()
  role: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
