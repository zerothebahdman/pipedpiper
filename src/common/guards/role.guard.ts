import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../services/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { roles } from '@prisma/client';
const prisma = new PrismaService();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const role = await prisma.roles.findMany({
      where: {
        title: {
          in: requiredRoles.map((role: string) => role),
        },
      },
    });

    const { user } = context.switchToHttp().getRequest();
    const isPermitted = role.some((role: roles) => role.id === user.rolesId);
    if (!isPermitted) {
      throw new ForbiddenException(
        'Oops! You are not authorized to perform this action',
      );
    }
    return isPermitted;
  }
}
