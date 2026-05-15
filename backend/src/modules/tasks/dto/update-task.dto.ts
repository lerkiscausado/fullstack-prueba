import { IsString, IsOptional, IsEnum, IsDateString, MinLength } from 'class-validator';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiProperty({ example: 'Título modificado', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El título no puede estar vacío' })
  title?: string;

  @ApiProperty({ example: 'Nueva descripción para la tarea', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Estado inválido. Valores: TODO, IN_PROGRESS, DONE' })
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority, required: false })
  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Prioridad inválida. Valores: LOW, MEDIUM, HIGH' })
  priority?: TaskPriority;

  @ApiProperty({ example: '2026-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato ISO 8601' })
  dueDate?: string;
}
