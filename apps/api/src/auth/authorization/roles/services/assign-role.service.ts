import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/service';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UserRole } from '@egxotech/database/client';

@Injectable()
export class RoleAssignmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Assign role to user
   */
  async assignRole(dto: AssignRoleDto): Promise<UserRole> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if already assigned
    const existingAssignment = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: dto.userId,
          roleId: dto.roleId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('User already has this role');
    }

    // Assign role
    const userRole = await this.prisma.userRole.create({
      data: {
        userId: dto.userId,
        roleId: dto.roleId,
      },
    });

    // Update user's claims cache
    await this.updateUserClaimsCache(dto.userId);

    return userRole;
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: number, roleId: number) {
    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId },
      },
    });

    if (!userRole) {
      throw new NotFoundException('User does not have this role');
    }

    await this.prisma.userRole.delete({
      where: { id: userRole.id },
    });

    // Update user's claims cache
    await this.updateUserClaimsCache(userId);

    return { message: 'Role removed successfully' };
  }

  /**
   * Get all user's roles
   */
  async getUserRoles(userId: number): Promise<UserRole[]> {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });
  }

  /**
   * Update user's claims cache (for performance)
   * 
   * Cache Structure:
   * User.claims = ["users.read", "posts.create", ...]
   * User.roles = [{ roleId: 1, roleName: "Admin", roleUuid: "..." }, ...]
   */
  private async updateUserClaimsCache(userId: number) {
    // Get all user's roles with permissions
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });

    // Collect all permissions from roles
    const claims = new Set<string>();
    const rolesCache: { roleId: number; roleName: string; roleUuid: string }[] = [];

    for (const userRole of userRoles) {
      const rolePermissions = userRole.role.permissions as string[];
      rolePermissions.forEach((perm) => claims.add(perm));

      rolesCache.push({
        roleId: Number(userRole.role.id),
        roleName: String(userRole.role.name),
        roleUuid: String(userRole.role.uuid),
      });
    }

    // Get user's direct permissions
    const userPermissions = await this.prisma.userPermission.findMany({
      where: { userId },
    });

    userPermissions.forEach((perm) => claims.add(perm.permissionCode));

    // Update user cache
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        claims: Array.from(claims),
        roles: rolesCache,
      },
    });

    return {
      claims: Array.from(claims),
      roles: rolesCache,
    };
  }

  /**
   * Refresh all user caches (bulk operation)
   */
  async refreshAllUserCaches() {
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    for (const user of users) {
      await this.updateUserClaimsCache(user.id);
    }

    return { updated: users.length };
  }
}