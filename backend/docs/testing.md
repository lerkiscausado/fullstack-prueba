# Estrategia de Pruebas

El proyecto utiliza **Jest** como motor de pruebas principal, siguiendo las mejores prácticas de NestJS para asegurar la calidad del código.

## 1. Pruebas Unitarias (Unit Tests)

Las pruebas unitarias se enfocan en probar componentes individuales (servicios y controladores) de forma aislada.

*   **Ubicación**: `src/**/*.spec.ts`
*   **Herramientas**: Jest, `@nestjs/testing`.
*   **Estrategia de Mocking**: 
    *   Se utiliza `jest.fn()` para simular el comportamiento de la base de datos (`PrismaService`).
    *   Esto permite que los tests sean rápidos y no dependan de una conexión real a PostgreSQL o Aiven.

### Ejemplo de Mock en Servicios:
```typescript
const mockPrismaService = {
  project: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
  },
};
```

## 2. Pruebas de Integración / E2E (End-to-End)

Estas pruebas validan el flujo completo de la aplicación, desde la petición HTTP hasta la respuesta, incluyendo la validación de guards y pipes.

*   **Ubicación**: `test/app.e2e-spec.ts`
*   **Herramientas**: Supertest.
*   **Propósito**: Verificar que los módulos se comuniquen correctamente entre sí.

## 3. Comandos de Ejecución

| Comando | Descripción |
|---------|-------------|
| `npm run test` | Ejecuta todas las pruebas unitarias. |
| `npm run test:watch` | Ejecuta los tests en modo observador (útil durante el desarrollo). |
| `npm run test:cov` | Genera un reporte de cobertura de código. |
| `npm run test:e2e` | Ejecuta las pruebas End-to-End. |

---

## Cobertura Actual

Actualmente, se han configurado pruebas base para:
- ✅ **AppController**: Verificación del endpoint raíz.
- ✅ **AuthService**: Estructura del servicio de autenticación.
- ✅ **ProjectsService & Controller**: Operaciones CRUD con mocks.
- ✅ **TasksService & Controller**: Operaciones CRUD con mocks.
