import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /** Obtener todos los proyectos */
  async findAll() {
    return this.prisma.project.findMany({
      include: { tasks: true },
    });
  }

  /** Obtener un proyecto por ID */
  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { tasks: true },
    });
  }

  /** Crear un nuevo proyecto */
  async create(createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({ data: createProjectDto });
  }

  /** Actualizar un proyecto existente */
  async update(id: string, updateProjectDto: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  /** Eliminar un proyecto */
  async remove(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
