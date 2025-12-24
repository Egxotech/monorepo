import { Module } from '@nestjs/common';
import { SystemInitializationService } from './system-initialization.service';
import { PrismaModule } from '../prisma/module';
import { RolesModule } from '../auth/authorization/roles/roles.module';

@Module({
  imports: [PrismaModule, RolesModule],
  providers: [SystemInitializationService],
  exports: [SystemInitializationService],
})
export class SystemAdministrationModule {}