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

