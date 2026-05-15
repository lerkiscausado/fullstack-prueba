# Proyecto Fullstack - Gestión de Proyectos y Tareas

Este proyecto es una solución integral para la gestión de tareas y proyectos, construida con tecnologías modernas y siguiendo principios de arquitectura sólida.

## Estructura del Proyecto

- `/backend`: NestJS, Prisma, PostgreSQL (Aiven).
- `/frontend`: Next.js (App Router), Tailwind CSS v4, shadcn/ui.
- `/docs`: Documentación técnica detallada.

## Requisitos Previos

- Node.js v20+
- Base de Datos PostgreSQL (Configurada en Aiven).

## Cómo Ejecutar

### 1. Backend
```bash
cd backend
npm install
# Asegúrate de tener el archivo .env configurado con DATABASE_URL y JWT_SECRET
npx prisma generate
npm run start:dev
```
*El backend se ejecutará en: http://localhost:3010*
*Documentación Swagger: http://localhost:3010/api*

### 2. Frontend
```bash
cd frontend
npm install
npm run dev -- -p 3020
```
*El frontend se ejecutará en: http://localhost:3020*

## Credenciales de Prueba
- **Usuario**: `lerkisers`
- **Password**: `800825ers`
*(O puedes registrarte directamente en la interfaz)*

## Decisiones Técnicas Clave
- **Seguridad**: JWT para autenticación stateless y RBAC para control de acceso (ADMIN/STANDARD).
- **Diseño**: Tipografía **Outfit** para una experiencia premium y componentes de **shadcn/ui**.
- **Arquitectura**: Principios **SOLID** aplicados en el backend para facilitar el mantenimiento.
