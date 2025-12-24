import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/service';
import { SessionsService } from '../../sessions/session.service';
import { RegisterDto } from './dto/register.dto';
import { jwtConfig } from '../../config/jwt.config';
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
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // User oluştur
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

    // Rol ataması (body'den gelen veya default BASIC)
    const roleNames = dto.roles && dto.roles.length > 0 
      ? dto.roles 
      : ['Basic User']; // Default

    // Rol isimlerini database'den bul
    const rolesToAssign = await this.prisma.role.findMany({
      where: {
        name: { in: roleNames },
        deletedAt: null,
      },
    });

    if (rolesToAssign.length === 0) {
      throw new BadRequestException('No valid roles found');
    }

    // Rolleri ata
    const allClaims = new Set<string>();
    const rolesCache: { roleId: number; roleName: string; roleUuid: string }[] = [];

    for (const role of rolesToAssign) {
      // user_roles tablosuna ekle
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      // Claims topla
      const rolePermissions = role.permissions as string[];
      rolePermissions.forEach((perm) => allClaims.add(perm));

      // Roles cache
      rolesCache.push({
        roleId: Number(role.id),
        roleName: String(role.name),
        roleUuid: String(role.uuid),
      });
    }

    // User claims cache'ini güncelle
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        claims: Array.from(allClaims),
        roles: rolesCache,
      },
    });

    return {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: rolesCache,
    };
  }

  // Login - token oluştur
  async login(user: User, ipAddress?: string, userAgent?: string) {
    // User'ın güncel claims'lerini database'den al
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        uuid: true,
        email: true,
        firstName: true,
        lastName: true,
        claims: true,
        roles: true,
      },  
    });

    const payload = {
      sub: fullUser!.id,
      email: fullUser!.email,
      uuid: fullUser!.uuid,
      claims: (fullUser!.claims as string[]) || [],
    };

    // Access token oluştur
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.accessTokenExpiresIn,
    });

    // Refresh token oluştur
    const refreshToken = this.jwtService.sign(
      { sub: fullUser!.id, type: 'refresh' },
      { expiresIn: jwtConfig.refreshTokenExpiresIn },
    );

    // Session kaydet
    await this.sessionService.createSession({
      userId: fullUser!.id,
      token: accessToken,
      ipAddress,
      userAgent,
      expiresIn: jwtConfig.accessTokenExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: fullUser!.id,
        uuid: fullUser!.uuid,
        email: fullUser!.email,
        firstName: fullUser!.firstName,
        lastName: fullUser!.lastName,
        claims: fullUser!.claims as string[],
        roles: fullUser!.roles,
      } as User,
    };
  }
}