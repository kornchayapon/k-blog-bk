import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessTokenGuard } from './access-token.guard';
import { AUTH_TYPE_KEY } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  >;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    console.log(authTypes);

    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();

    // Declare the default error
    let error = new UnauthorizedException();

    for (const instance of guards) {
      console.log('instance', instance);

      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error = err;
      });

      // Display Can Activate
      console.log('canActivate', canActivate);

      if (canActivate) {
        return true;
      }
    }

    throw error;
  }
}
