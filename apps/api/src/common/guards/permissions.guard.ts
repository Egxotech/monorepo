import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { UserPayload } from '../types/request-with-user.type';

/**
 * Permission-based authorization guard
 * 
 * Lifecycle:
 * 1. JwtAuthGuard validates token → attaches user to request
 * 2. PermissionsGuard checks user.claims
 * 3. If user has required permissions → allow
 * 4. Otherwise → throw 403 Forbidden
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required permissions from @RequirePermissions() decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    // Get user from request (set by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user: UserPayload = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // DEBUG: Log için
    console.log('🔍 PermissionsGuard Debug:');
    console.log('  Required permissions:', requiredPermissions);
    console.log('  User claims:', user.claims);
    console.log('  User ID:', user.sub);

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      user.claims.includes(permission),
    );

    if (!hasAllPermissions) {
      console.log('  ❌ Permission denied!');
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}. You have: ${user.claims.join(', ')}`,
      );
    }

    console.log('  ✅ Permission granted!');
    return true;
  }
}

