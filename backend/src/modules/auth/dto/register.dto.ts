import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe', description: 'Nombre de usuario único' })
  @IsString()
  @MinLength(3, { message: 'El nickname debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El nickname no puede tener más de 20 caracteres' })
  nickname: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña de al menos 6 caracteres' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
