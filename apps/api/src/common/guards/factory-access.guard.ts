import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@i-factory/api-types';
import { CurrentUserPayload } from '../decorators/current-user.decorator';
import { Request } from 'express';

@Injectable()
export class FactoryAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user: CurrentUserPayload }>();
    const user = request.user;

    // Super admin can access all factories
    if (user.role === UserRole.SUPER_ADMIN) return true;

    const factoryId = (request.params['factoryId'] ?? request.body?.factoryId ?? request.query['factoryId']) as string | undefined;

    if (!factoryId) return true; // No factory context required for this route

    if (!user.allowedFactories.includes(factoryId)) {
      throw new ForbiddenException('Access to this factory is not allowed');
    }

    return true;
  }
}
