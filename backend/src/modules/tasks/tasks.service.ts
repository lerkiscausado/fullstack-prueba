import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  /** Listar tareas (opcionalmente filtradas por proyecto) */
  async findAll(projectId?: string) {
    return this.prisma.task.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: true },
    });
  }

  /** Buscar una tarea por ID */
  async findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });
  }

  /** Crear una nueva tarea */
  async create(createTaskDto: CreateTaskDto) {
    const { dueDate, ...rest } = createTaskDto;
    return this.prisma.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });
  }

  /** Editar una tarea */
  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const { dueDate, ...rest } = updateTaskDto;
    return this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });
  }

  /** Borrar una tarea */
  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
