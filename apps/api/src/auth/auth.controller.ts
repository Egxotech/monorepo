import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestWithUser, UserPayload } from '../common/types/request-with-user.type';

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
  async login(@Body() dto: LoginDto, @Req() req: UserPayload & RequestWithUser) {
    // LocalStrategy user validated and req.user added
    return this.authService.login(
      req.user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('me')
  getProfile(@CurrentUser() user: UserPayload & RequestWithUser) {
    return {
      id: user.user.sub,
      email: user.user.email,
      uuid: user.user.uuid,
      claims: user.user.claims,
    };
  }
}