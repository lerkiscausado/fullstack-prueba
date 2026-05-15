# Aplicación de Principios SOLID

El código ha sido diseñado siguiendo los principios SOLID para garantizar un software robusto.

## 1. Single Responsibility Principle (SRP)
Cada clase tiene una única responsabilidad definida:
*   **Controllers**: Solo manejan peticiones y respuestas HTTP.
*   **Services**: Solo contienen la lógica de negocio.
*   **PrismaService**: Solo gestiona la conexión a la base de datos.
*   **DTOs**: Solo definen la estructura y validación de los datos.

## 2. Open/Closed Principle (OCP)
Los módulos están diseñados para ser extensibles sin modificar su núcleo. Por ejemplo, al agregar el `AuthModule`, no fue necesario modificar la lógica interna de `ProjectsModule` o `TasksModule`. Simplemente se inyectaron los `Guards` necesarios.

## 3. Liskov Substitution Principle (LSP)
El `PrismaService` extiende de `PrismaClient`. Puede ser utilizado en cualquier lugar donde se espere un cliente de Prisma, respetando el contrato de la clase base pero añadiendo funcionalidades de ciclo de vida de NestJS (`OnModuleInit`).

## 4. Interface Segregation Principle (ISP)
Aunque TypeScript no utiliza interfaces pesadas en este contexto, el uso de DTOs específicos (`CreateTaskDto` vs `UpdateTaskDto`) asegura que los clientes de la API y los servicios solo dependan de los campos que realmente necesitan para cada operación.

## 5. Dependency Inversion Principle (DIP)
El corazón de NestJS es la **Inyección de Dependencias**.
*   Los controladores no instancian los servicios (`new Service()`).
*   Los servicios no instancian la base de datos.
*   En su lugar, todas las dependencias se inyectan a través del constructor, lo que facilita enormemente el testing unitario mediante el uso de "mocks".
