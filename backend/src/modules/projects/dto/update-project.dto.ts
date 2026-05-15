import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiProperty({ example: 'Proyecto Actualizado', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El nombre no puede estar vacío' })
  name?: string;

  @ApiProperty({ example: 'Nueva descripción...', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
