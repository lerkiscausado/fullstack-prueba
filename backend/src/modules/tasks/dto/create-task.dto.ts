import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, MinLength } from 'class-validator';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Finalizar informe', description: 'Título de la tarea' })
  @IsString()
  @MinLength(1, { message: 'El título de la tarea es requerido' })
  title: string;

  @ApiProperty({ example: 'Detalles sobre la tarea...', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-del-proyecto', description: 'ID del proyecto al que pertenece' })
  @IsUUID('4', { message: 'El projectId debe ser un UUID válido' })
  projectId: string;

  @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO, required: false })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Estado inválido. Valores: TODO, IN_PROGRESS, DONE' })
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority, default: TaskPriority.MEDIUM, required: false })
  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Prioridad inválida. Valores: LOW, MEDIUM, HIGH' })
  priority?: TaskPriority;

  @ApiProperty({ example: '2026-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato ISO 8601' })
  dueDate?: string;
}
