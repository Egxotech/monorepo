import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { isValidPermission } from '../../constants/permissions.constant';
import { Role } from '@egxotech/database/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) { }

  /**
   * Create new role
   */
  async create(dto: CreateRoleDto): Promise<Role> {
    // Check if role name already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (existingRole) {
      throw new ConflictException(`Role "${dto.name}" already exists`);
    }

    // Validate permissions
    for (const perm of dto.permissions) {
      if (!isValidPermission(perm)) {
        throw new BadRequestException(`Invalid permission: ${perm}`);
      }
    }

    // Create role
    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions,
        type: 'CUSTOM', // User-created roles are CUSTOM
        order: dto.order || 0,
      },
    });
  }

  /**
   * Get all roles
   */
  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { userRoles: true }, // Count users with this role
        },
      },
      orderBy: { order: 'desc' }, // Higher order first
    });
  }

  /**
   * Get single role by ID
   */
  async findById(id: number): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id, deletedAt: null },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                uuid: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  /**
   * Get role by name
   */
  async findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { name, deletedAt: null },
    });
  }

  /**
   * Update role
   */
  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);

    // Cannot update BASIC or ADMIN system roles
    if (role.type !== 'CUSTOM') {
      throw new BadRequestException(`Cannot update system role: ${role.name}`);
    }

    // Check name uniqueness if updating name
    if (dto.name && dto.name !== role.name) {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: dto.name },
      });

      if (existingRole) {
        throw new ConflictException(`Role "${dto.name}" already exists`);
      }
    }

    // Validate permissions if updating
    if (dto.permissions) {
      for (const perm of dto.permissions) {
        if (!isValidPermission(perm)) {
          throw new BadRequestException(`Invalid permission: ${perm}`);
        }
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions,
        order: dto.order,
      },
    });
  }

  /**
   * Soft delete role
   */
  async delete(id: number): Promise<Role> {
    const role = await this.findById(id);

    // Cannot delete BASIC or ADMIN system roles
    if (role.type !== 'CUSTOM') {
      throw new BadRequestException(`Cannot delete system role: ${role.name}`);
    }

    // Check if any users have this role
    const userCount = await this.prisma.userRole.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        `Cannot delete role. ${userCount} user(s) still have this role.`,
      );
    }

    return this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(roleId: number): Promise<string[]> {
    const role = await this.findById(roleId);
    return role.permissions as string[];
  }
}