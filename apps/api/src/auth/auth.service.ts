import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/service';
import { SessionsService } from '../sessions/session.service';
import { RegisterDto } from './dto/register.dto';
import { jwtConfig } from '../common/config/jwt.config';
import { User } from '@egxotech/database/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private sessionService: SessionsService,
  ) {}

  // Email/password kontrolü (LocalStrategy kullanır)
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Account is inactive');
    }

    return user;
  }

  // Yeni kullanıcı kaydı
  async register(dto: RegisterDto): Promise<User> {
    // Email zaten kayıtlı mı?
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        name: `${dto.firstName} ${dto.lastName}`,
        emailVerified: false,
      },
    });

    return {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async login(user: User, ipAddress?: string, userAgent?: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      uuid: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }> {
    const payload = {
      sub: user.id,
      email: user.email,
      uuid: user.uuid,
      claims: [], 
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.accessTokenExpiresIn,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: jwtConfig.refreshTokenExpiresIn },
    );

    await this.sessionService.createSession({
      userId: user.id,
      token: accessToken,
      ipAddress,
      userAgent,
      expiresIn: jwtConfig.accessTokenExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}