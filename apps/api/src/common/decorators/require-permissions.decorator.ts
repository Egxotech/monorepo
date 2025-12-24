import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Require specific permissions to access route
 * 
 * @example
 * @RequirePermissions('users.create', 'users.update')
 * @Post('users')
 * createUser() { }
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

