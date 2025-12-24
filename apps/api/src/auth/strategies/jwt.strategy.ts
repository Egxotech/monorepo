import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../../common/config/jwt.config';
import { UserPayload } from '../../common/types/request-with-user.type';
import { UsersService } from '../../users/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  // Token decode edildikten sonra bu method çalışır
  // Döndürdüğün object request.user olur
  async validate(payload: any): Promise<UserPayload> {
    // User hala aktif mi kontrol et
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('User no longer active');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      uuid: payload.uuid,
      claims: payload.claims || [],
    };
  }
}