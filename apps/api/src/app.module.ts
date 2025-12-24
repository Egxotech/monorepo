import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/module';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../../config/database/.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    SessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService], // ← AppService eklendi
})
export class AppModule {}