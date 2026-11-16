# Design: Arquitectura y Modelo de Datos del MVP Recuerda+ con PostgreSQL

## Context

Para la versión 1.0 (MVP), la aplicación evoluciona de almacenamiento aislado en navegador a un backend ligero con persistencia en PostgreSQL, garantizando la centralización, integridad referencial y disponibilidad de los datos académicos del estudiante. Para la motivación del cambio y el alcance general, ver [proposal.md](file:///g:/planning/openspec/changes/mvp-planning/proposal.md).

## Goals / Non-Goals

**Goals:**
- Centralizar y estructurar los datos de usuarios, pendientes y sugerencias en una base de datos relacional PostgreSQL.
- Configurar la conexión mediante la variable de entorno estándar `DATABASE_URL` utilizando un pool de conexiones optimizado.
- Garantizar la integridad referencial y la consistencia mediante esquemas relacionales, restricciones `CHECK` e índices.
- Versionar el esquema de base de datos a través de scripts de migración SQL reproducibles.

**Non-Goals:**
- Configuración de clústeres distribuidos multirregión (excesivo para el MVP).
- Soporte para bases de datos NoSQL o esquemas híbridos en esta etapa.

## Decisions

### Decisión 1: Persistencia centralizada en PostgreSQL mediante Pool de Conexiones
- **Elección**: Usar PostgreSQL con el driver oficial `pg` (`node-postgres`) administrado mediante un pool de conexiones (`Pool`).
- **Alternativas consideradas**:
  - `localStorage`: Limitado al dispositivo local, propenso a pérdidas al limpiar la caché y sin sincronización.
  - SQLite: Adecuado para prototipos embebidos pero limitado para concurrencia multiusuario en despliegues cloud/servidor.
- **Razón**: PostgreSQL ofrece robustez, soporte estándar para transacciones ACID, tipado estricto y escalabilidad inmediata.

### Decisión 2: Configuración parametrizada con `DATABASE_URL`
- **Elección**: Centralizar los parámetros de conexión en una única URI `DATABASE_URL` gestionada por variables de entorno y `.env`.
- **Razón**: Cumple con el estándar de Twelve-Factor App, facilitando transiciones transparentes entre entornos de desarrollo, pruebas y producción.

### Decisión 3: Migraciones estructuradas en SQL puro
- **Elección**: Escribir scripts SQL de migración (DDL) explícitos para la creación de tablas, índices y restricciones.
- **Alternativas consideradas**: ORM pesado (como Prisma o TypeORM).
- **Razón**: Mantiene el MVP ligero, sin dependencias complejas de compilación ni sobrecarga de abstracción en JavaScript/Node.js.

---

## Variables de Entorno

| Variable | Tipo | Requerida | Ejemplo / Descripción |
|---|---|---|---|
| `DATABASE_URL` | String (URI) | Sí | `postgresql://postgres:password@localhost:5432/recuerda_db` |
| `PORT` | Número | No | `3000` (Puerto de escucha del servidor, por defecto 3000) |
| `NODE_ENV` | String | No | `'development'` o `'production'` |

---

## Arquitectura de la Base de Datos

```mermaid
erDiagram
    USUARIOS ||--o{ PENDIENTES : "posee (1 a N)"
    USUARIOS ||--o{ SUGERENCIAS : "envia (1 a N)"

    USUARIOS {
        uuid id PK "Identificador único (gen_random_uuid())"
        varchar email UK "Correo electrónico único"
        varchar password_hash "Hash determinista o bcrypt"
        timestamptz created_at "Fecha de registro"
    }

    PENDIENTES {
        uuid id PK "Identificador único"
        uuid usuario_id FK "Referencia a usuarios(id) ON DELETE CASCADE"
        varchar tipo "Tipo: 'tarea' o 'examen'"
        varchar titulo "Título descriptivo (máx. 80 car.)"
        varchar materia "Materia o asignatura (máx. 40 car.)"
        timestamptz fecha_limite "Fecha y hora límite"
        integer recordatorio_horas "Horas de aviso: 1, 3, 24 o 48"
        varchar estado "Estado: 'pendiente', 'en progreso', 'hecho'"
        boolean notificado "Bandera de aviso emitido"
        timestamptz created_at "Fecha de creación"
        timestamptz updated_at "Última actualización"
    }

    SUGERENCIAS {
        uuid id PK "Identificador único"
        uuid usuario_id FK "Referencia a usuarios(id) ON DELETE CASCADE"
        varchar tipo "Tipo: 'error' o 'mejora'"
        text mensaje "Detalle del reporte (5-500 car.)"
        timestamptz created_at "Fecha de envío"
    }
```

### Diseño Detallado de Tablas y Scripts DDL

```sql
-- Extensión para generación de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- 2. Tabla de Pendientes (Tareas y Exámenes)
CREATE TABLE IF NOT EXISTS pendientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('tarea', 'examen')),
    titulo VARCHAR(80) NOT NULL,
    materia VARCHAR(40),
    fecha_limite TIMESTAMPTZ NOT NULL,
    recordatorio_horas INTEGER NOT NULL DEFAULT 24 CHECK (recordatorio_horas IN (1, 3, 24, 48)),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en progreso', 'hecho')),
    notificado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pendientes_usuario ON pendientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pendientes_fecha ON pendientes(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_pendientes_estado ON pendientes(estado);

-- 3. Tabla de Sugerencias y Reporte de Fallos
CREATE TABLE IF NOT EXISTS sugerencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('error', 'mejora')),
    mensaje VARCHAR(500) NOT NULL CHECK (char_length(mensaje) >= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sugerencias_usuario ON sugerencias(usuario_id);
```

---

## Risks / Trade-offs

- **[Riesgo] Disponibilidad de conexión a la base de datos** → *Mitigación:* Se implementa un pool con reconexión automática y verificación de healthcheck (`SELECT 1`).
- **[Riesgo] Exposición accidental de credenciales** → *Mitigación:* `DATABASE_URL` se carga estrictamente desde `.env` y este archivo se excluye en `.gitignore`.
