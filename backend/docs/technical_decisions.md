# Decisiones Técnicas

Este documento detalla la justificación detrás de las tecnologías y patrones seleccionados.

## 1. NestJS (Framework)
**Decisión**: Utilizar NestJS en lugar de Express puro.
**Razón**: NestJS proporciona una estructura opinionada que obliga a usar módulos, servicios y controladores, lo que facilita el trabajo en equipo y la mantenibilidad a largo plazo. Además, incluye soporte nativo para TypeScript y dependencias de primer nivel para validación y seguridad.

## 2. Prisma 7 & Driver Adapters
**Decisión**: Utilizar el adaptador `@prisma/adapter-pg`.
**Razón**: Con la llegada de Prisma 7, la arquitectura de conexión ha evolucionado. Para garantizar la mejor compatibilidad con entornos modernos y optimizar el pool de conexiones, se implementó el adaptador manual de PostgreSQL.

## 3. Aiven (Database Cloud)
**Decisión**: PostgreSQL alojado en Aiven.
**Razón**: Aiven ofrece una capa gratuita robusta para bases de datos administradas. Se configuró SSL con `rejectUnauthorized: false` para permitir certificados autofirmados en desarrollo, garantizando una conexión segura sin complicaciones de infraestructura local.

## 4. Autenticación con JWT & Bcrypt
**Decisión**: Stateless Auth con JWT y hashing con Bcrypt.
**Razón**: JWT permite que el servidor no necesite almacenar sesiones en memoria o base de datos (escalabilidad horizontal). Bcrypt es el estándar de la industria para el hashing de contraseñas debido a su resistencia a ataques de fuerza bruta (cost factor).

## 5. Swagger
**Decisión**: Open API (Swagger) habilitado.
**Razón**: Facilita enormemente el testeo manual y sirve como contrato para el equipo de frontend. Proporciona una interfaz visual donde se pueden probar los tokens y las validaciones de los DTOs en tiempo real.
