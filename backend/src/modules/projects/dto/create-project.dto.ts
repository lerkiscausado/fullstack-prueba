import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Nuevo Proyecto', description: 'Nombre del proyecto' })
  @IsString()
  @MinLength(1, { message: 'El nombre del proyecto es requerido' })
  name: string;

  @ApiProperty({ example: 'Descripción del proyecto...', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
