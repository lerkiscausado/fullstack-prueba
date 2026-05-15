import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /** Registro de nuevo usuario */
  async register(nickname: string, password: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { nickname },
    });

    if (existingUser) {
      throw new ConflictException('El nickname ya está en uso');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        nickname,
        password: hashedPassword,
      },
    });

    // Return user without password
    const { password: _, ...result } = user;
    return result;
  }

  /** Inicio de sesión y generación de token */
  async login(nickname: string, password: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { nickname },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generate JWT
    const payload = { sub: user.id, nickname: user.nickname, rol: user.rol };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        nickname: user.nickname,
        rol: user.rol,
      },
    };
  }
}
