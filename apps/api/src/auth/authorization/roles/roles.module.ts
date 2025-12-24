import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './services/roles.service';
import { RoleAssignmentService } from './services/assign-role.service';
import { PrismaModule } from '../../../prisma/module';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';

@Module({
  imports: [PrismaModule],
  controllers: [RolesController],
  providers: [
    RolesService,
    RoleAssignmentService,
    // Activate PermissionsGuard for this module
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [RolesService, RoleAssignmentService],
})
export class RolesModule {}