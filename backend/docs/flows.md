# Flujos de Datos

A continuación se describen los flujos principales del sistema.

## 1. Flujo de Autenticación (Login)

El sistema utiliza JWT (JSON Web Tokens) para mantener el estado de la sesión de forma stateless.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as AuthController
    participant S as AuthService
    participant DB as PostgreSQL (Aiven)

    U->>C: POST /auth/login (nickname, password)
    C->>S: login(nickname, password)
    S->>DB: Buscar usuario por nickname
    DB-->>S: Retorna usuario (con hash)
    S->>S: Comparar password (bcrypt)
    S-->>C: Generar access_token (JWT)
    C-->>U: Retorna 200 OK + access_token
```

## 2. Flujo de Autorización (RBAC)

El acceso a los recursos está protegido por roles. Solo el rol `ADMIN` puede realizar cambios (escritura/borrado).

```mermaid
flowchart TD
    Req[Petición HTTP] --> JwtGuard{¿JWT Válido?}
    JwtGuard -- No --> Error401[401 Unauthorized]
    JwtGuard -- Si --> RoleGuard{¿Rol Requerido?}
    RoleGuard -- No --> Controller[Ejecutar Controlador]
    RoleGuard -- Si --> Check{¿Es ADMIN?}
    Check -- No --> Error403[403 Forbidden]
    Check -- Si --> Controller
```

## 3. Flujo de Gestión de Tareas

```mermaid
sequenceDiagram
    participant U as Admin
    participant C as TasksController
    participant S as TasksService
    participant DB as Prisma

    U->>C: POST /tasks (CreateTaskDto)
    Note right of C: Validado por ValidationPipe
    C->>S: create(dto)
    S->>DB: prisma.task.create(...)
    DB-->>S: Retorna Task
    S-->>C: Retorna Task
    C-->>U: 201 Created
```
