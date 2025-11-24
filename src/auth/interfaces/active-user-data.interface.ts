import { UserRole } from '../enums/user.role.enum';

export interface ActiveUserData {
  // user id
  sub: number;
  email: string;
  role: UserRole;
}
