import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  nickname: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(1, { message: 'La contraseña es requerida' })
  password: string;
}
