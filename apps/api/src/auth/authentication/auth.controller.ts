import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import * as requestWithUserType from '../../common/types/request-with-user.type';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: requestWithUserType.RequestWithUser) {
    // LocalStrategy user validated and req.user added
    return this.authService.login(
      req.user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('me')
  getProfile(@CurrentUser() user: requestWithUserType.UserPayload) {
    if (!user) {
      throw new Error('User not found in request');
    }
    
    return {
      id: user.sub,
      email: user.email,
      uuid: user.uuid,
      claims: user.claims,
    };
  }
}