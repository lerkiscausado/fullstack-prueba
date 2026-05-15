import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Endpoint para registrar usuarios */
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.nickname,
      registerDto.password,
    );
  }

  /** Endpoint para iniciar sesión */
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.nickname, loginDto.password);
  }
}
