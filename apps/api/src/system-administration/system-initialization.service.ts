import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/service';
import { DEFAULT_PERMISSION_SETS, PERMISSIONS } from '../auth/authorization/constants/permissions.constant';
import { RolesService } from '../auth/authorization/roles/services/roles.service';

@Injectable()
export class SystemInitializationService implements OnModuleInit {
  private readonly logger = new Logger(SystemInitializationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Runs when application starts
   * Creates default roles if they don't exist
   */
  async onModuleInit() {
    this.logger.log('🚀 System initialization started...');

    await this.createDefaultRoles();
    await this.createDefaultAdminUser();

    this.logger.log('✅ System initialization completed!');
  }

  /**
   * Create default BASIC and ADMIN roles
   */
  private async createDefaultRoles() {
    // Check if BASIC role exists
    const basicRole = await this.prisma.role.findFirst({
      where: { type: 'BASIC' },
    });

    if (!basicRole) {
      await this.prisma.role.create({
        data: {
          name: 'Basic User',
          description: 'Default role for all registered users',
          type: 'BASIC',
          permissions: DEFAULT_PERMISSION_SETS.BASIC,
          order: 1,
        },
      });
      this.logger.log('✅ Created default BASIC role');
    } else {
      this.logger.log('⏭️  BASIC role already exists, skipping...');
    }

    // Check if ADMIN role exists
    const adminRole = await this.prisma.role.findFirst({
      where: { type: 'ADMIN' },
    });

    if (!adminRole) {
      await this.prisma.role.create({
        data: {
          name: 'Administrator',
          description: 'System administrator with full access',
          type: 'ADMIN',
          permissions: DEFAULT_PERMISSION_SETS.ADMIN,
          order: 999, // Highest order
        },
      });
      this.logger.log('✅ Created default ADMIN role');
    } else {
      this.logger.log('⏭️  ADMIN role already exists, skipping...');
    }
  }

  /**
   * Create default admin user (optional)
   * Uncomment if you want a default admin on first run
   */
  private async createDefaultAdminUser() {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';

    // Check if admin user exists
    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      this.logger.log('⏭️  Admin user already exists, skipping...');
      return;
    }

    // Uncomment to auto-create admin user on first run:
    /*
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(
      process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
      10,
    );

    const adminUser = await this.prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        emailVerified: true,
        isActive: true,
      },
    });

    // Assign ADMIN role
    const adminRole = await this.prisma.role.findFirst({
      where: { type: 'ADMIN' },
    });

    if (adminRole) {
      await this.prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      });

      // Update user claims cache
      await this.prisma.user.update({
        where: { id: adminUser.id },
        data: {
          claims: DEFAULT_PERMISSION_SETS.ADMIN,
          roles: [
            {
              roleId: adminRole.id,
              roleName: adminRole.name,
              roleUuid: adminRole.uuid,
            },
          ],
        },
      });

      this.logger.log(`✅ Created default admin user: ${adminEmail}`);
    }
    */

    this.logger.log('ℹ️  Default admin user creation is disabled (optional feature)');
  }

  /**
   * Manually trigger system initialization
   * Useful for testing or manual execution
   */
  async initialize() {
    await this.createDefaultRoles();
    await this.createDefaultAdminUser();
  }
}