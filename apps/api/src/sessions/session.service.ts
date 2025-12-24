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
    expiresIn: string;
  }) {
    const expiresAt = this.calculateExpiryDate(data.expiresIn);

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

  async findByToken(token: string) : Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteSession(token: string) {
    return this.prisma.session.delete({
      where: { token },
    });
  }

  private calculateExpiryDate(expiresIn: string): Date {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error('Invalid expiresIn format');

    const value = parseInt(match[1]);
    const unit = match[2];
    const now = new Date();

    switch (unit) {
      case 's': return new Date(now.getTime() + value * 1000);
      case 'm': return new Date(now.getTime() + value * 60 * 1000);
      case 'h': return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd': return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default: throw new Error('Invalid time unit');
    }
  }
}