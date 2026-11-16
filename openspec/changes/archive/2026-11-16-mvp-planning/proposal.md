# Proposal: Construcción del MVP de Recuerda+ con PostgreSQL

## Why

Los estudiantes jóvenes suelen anotar sus tareas, exámenes y entregas de forma dispersa (cuadernos, chats, notas sueltas o memoria), lo que provoca olvidos frecuentes, falta de visibilidad sobre las urgencias de la semana y pérdida de calificaciones por falta de planificación oportuna.

Recuerda+ nace para resolver este problema centralizando los pendientes académicos en un único lugar accesible desde el celular, con alertas oportunas calculadas con anticipación para que el estudiante planifique su tiempo sin estrés.

## What Changes

Se implementará el MVP (versión 1.0) como aplicación web móvil con arquitectura cliente-servidor respaldada por una base de datos relacional PostgreSQL.

### Qué incluye el MVP
- **Persistencia en PostgreSQL**: Almacenamiento centralizado y estructurado con pool de conexiones administrado por `DATABASE_URL` y scripts SQL de migración inicial.
- **Autenticación de usuarios**: Registro e inicio de sesión con correo electrónico y contraseña (almacenada con hash seguro en tabla `usuarios`), además de cierre de sesión seguro (RF01, RF02).
- **Gestión de tareas y exámenes**: Creación, consulta, modificación y eliminación (CRUD) de pendientes en tabla `pendientes` indicando tipo (tarea o examen), título, materia, fecha y hora límite (RF03, RF08).
- **Estados de avance**: Transición de pendientes entre los estados `pendiente`, `en progreso` y `hecho` (RF05).
- **Lista cronológica y filtros**: Lista ordenada por fecha límite con secciones para vencidos, hoy, mañana y posteriores, alerta de entregas en las próximas 24 horas y filtro por tipo (todo, tareas, exámenes) (RF04, RF10).
- **Calendario mensual en cuadrícula**: Navegación por meses, indicadores visuales de días con tareas o exámenes y panel de detalle de pendientes por día seleccionado (RF07).
- **Sistema de avisos anticipados**: Generación de avisos con anticipación configurable (1, 3, 24 o 48 horas; por defecto 24 horas antes) y centro de avisos con alertas activas y programadas (RF06, RF09, RF11).
- **Reporte de fallos y sugerencias**: Formulario simple para enviar comentarios, reportes de error o ideas de mejora guardados en la tabla `sugerencias` (RF12).

### Qué NO incluye el MVP (Fuera de alcance)
- **Integración con plataformas académicas**: No se conectará con aulas virtuales (Moodle, Blackboard, Canvas) ni correos institucionales (RF16).
- **Chat o red social**: No habrá mensajería, comentarios ni funciones sociales entre estudiantes (RF17).
- **Gamificación**: No se incluirán puntos, medallas, niveles ni rachas de cumplimiento (RF18).
- **Notificaciones push nativas**: No se implementarán servicios de mensajería push en segundo plano para app cerrada (RF13).
- **Recordatorios repetidos**: No habrá insistencia cíclica de avisos para pendientes no completados (RF14).
- **Modo oscuro**: No se incluirán temas visuales alternativos en esta versión (RF15).

## Capabilities

### New Capabilities
- `user-auth`: Registro de cuenta, inicio y cierre de sesión con validación de credenciales contra la base de datos PostgreSQL.
- `task-management`: Alta, edición, baja lógica/física y actualización de estados (`pendiente`, `en progreso`, `hecho`) para tareas y exámenes en base de datos.
- `views-and-filters`: Visualización cronológica de pendientes agrupados por fecha/urgencia, calendario mensual interactivo y filtros por tipo de pendiente.
- `reminders`: Configuración del tiempo de anticipación, cálculo automático de recordatorios y centro de avisos activos y programados.
- `feedback`: Formulario de reporte de fallos y sugerencias de mejora con historial de envíos del estudiante en PostgreSQL.

### Modified Capabilities
(Ninguna)

## Impact

- **Código y estructura**: Organización modular de componentes para interfaz web móvil y capa de conexión/consultas a la base de datos PostgreSQL.
- **Almacenamiento**: Persistencia relacional en base de datos PostgreSQL con tablas (`usuarios`, `pendientes`, `sugerencias`), integridad referencial, índices y pool de conexiones parametrizado vía `DATABASE_URL`.
- **APIs del navegador**: Integración con la API estándar de notificaciones del navegador (`Notification API`).
