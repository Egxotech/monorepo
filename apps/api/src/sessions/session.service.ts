import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/service';
import { Session } from '@egxotech/database/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async createSession(data: {
    userId: number;
    token: string;
    ipAddress?: string;
    userAgent?: string;
    expiresIn: number; // seconds
  }): Promise<Session> {
    const expiresAt = new Date(Date.now() + data.expiresIn * 1000);

    return this.prisma.session.create({
      data: {
        userId: data.userId,
        token: data.token,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent?.substring(0, 512), 
        expiresAt,
      },
    });
  }

  async findByToken(token: string): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteSession(token: string): Promise<Session> {
    return this.prisma.session.delete({
      where: { token },
    });
  }
}