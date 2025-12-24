import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/module';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/authentication/auth.module';
import { SessionsModule } from './sessions/session.module';
import { RolesModule } from './auth/authorization/roles/roles.module';
import { SystemAdministrationModule } from './system-administration/system-administration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../../config/database/.env',
    }),
    PrismaModule,
    SystemAdministrationModule,        // ← System initialization (seed)
    UsersModule,
    AuthModule,
    SessionsModule,
    RolesModule, // ← RBAC system
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}