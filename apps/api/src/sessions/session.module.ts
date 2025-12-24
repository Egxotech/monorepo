import { Module } from '@nestjs/common';
import { SessionsService } from './session.service';
import { PrismaModule } from '../prisma/module';

@Module({
  imports: [PrismaModule],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}