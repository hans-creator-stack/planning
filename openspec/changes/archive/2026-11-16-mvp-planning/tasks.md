# Tasks: Construcción del MVP de Recuerda+ con PostgreSQL

## 1. Configuración de PostgreSQL y Base de Datos

- [x] 1.1 Instalar las dependencias de PostgreSQL (`pg`, `dotenv`) en el proyecto y verificar que aparezcan registradas en `package.json` ejecutando `npm list --depth=0` (20 min).
- [x] 1.2 Configurar el módulo de conexión a PostgreSQL (`db.js` o `db/index.js`) utilizando `DATABASE_URL` con un pool (`new Pool()`), validando variables de entorno y verificando la conexión exitosa con una consulta `SELECT NOW()` (30 min).
- [x] 1.3 Escribir el script SQL de migración inicial (`migrations/001_initial_schema.sql` o `scripts/migrate.js`) con las tablas `usuarios`, `pendientes` y `sugerencias`, sus restricciones e índices. Verificar su ejecución y validar la existencia de las tablas en PostgreSQL mediante `\dt` o consulta al `information_schema` (30 min).

## 2. Estructura Base y Diseño Visual de la Interfaz

- [x] 2.1 Configurar el archivo base HTML5 con estructura móvil (`viewport-fit=cover`, contenedor máx. 430px) y cabecera con botón de salir. Verificar abriendo en navegador y confirmando la visualización adaptada a móvil (30 min).
- [x] 2.2 Definir los estilos CSS con variables de diseño según la paleta (#FDFDFF, #0D1821, #17BEBB, #7A6F9B y #C03221). Verificar aplicando clases a componentes y tarjetas de prueba (30 min).

## 3. Autenticación y Gestión de Usuarios con PostgreSQL (RF01, RF02)

- [x] 3.1 Maquetar el formulario de autenticación con campos para correo y contraseña, mensajes de validación y botón de alternancia entre registro e inicio. Verificar visualmente el cambio de textos y modo (25 min).
- [x] 3.2 Implementar el registro de usuario (RF01) validando correo, longitud de contraseña (mín. 6 caracteres), hashing seguro e inserción en la tabla `usuarios`. Verificar registrando un usuario y comprobando el registro en base de datos (30 min).
- [x] 3.3 Implementar el inicio y cierre de sesión (RF02) validando credenciales contra la tabla `usuarios` y gestionando la sesión activa. Verificar iniciando sesión y cerrándola con retorno a la pantalla inicial (25 min).

## 4. Gestión y Estados de Tareas y Exámenes en PostgreSQL (RF03, RF05, RF08)

- [x] 4.1 Maquetar el formulario modal deslizable (sheet) para registro y edición de pendientes con campos: tipo, título, materia, fecha/hora y anticipación. Verificar apertura y cierre modal (25 min).
- [x] 4.2 Implementar la creación de tareas y exámenes (RF03) con inserción en la tabla `pendientes` asociada al `usuario_id` autenticado. Verificar creando una tarea y comprobando su persistencia en PostgreSQL (30 min).
- [x] 4.3 Implementar la actualización cíclica de estados (RF05) ('pendiente' -> 'en progreso' -> 'hecho') actualizando el registro en la base de datos y en la interfaz. Verificar el cambio visual y en tabla `pendientes` (25 min).
- [x] 4.4 Implementar la edición de pendientes existentes (RF08) con actualización de datos en PostgreSQL y reprogramación de aviso. Verificar editando título y fecha de entrega (30 min).
- [x] 4.5 Implementar la eliminación de pendientes (RF08) con confirmación previa y eliminación en la tabla `pendientes`. Verificar borrando un registro y confirmando su ausencia en la base de datos (20 min).

## 5. Vistas Cronológica, Filtros y Calendario (RF04, RF07, RF10)

- [x] 5.1 Implementar la consulta y renderizado de la lista cronológica (RF04) ordenando por `fecha_limite` y agrupando en secciones ('Vencidos', 'Hoy', 'Mañana' y posteriores). Verificar el ordenamiento cronológico (30 min).
- [x] 5.2 Agregar banner de alerta para entregas en próximas 24 horas y botones de filtro por tipo (RF10: 'Todo', 'Tareas', 'Exámenes'). Verificar filtrado interactivo (25 min).
- [x] 5.3 Maquetar e implementar el calendario mensual en cuadrícula (RF07) con navegación de meses e indicadores de días con pendientes según datos de PostgreSQL. Verificar navegación de mes y detalle por día (30 min).

## 6. Sistema de Avisos Anticipados y Notificaciones (RF06, RF09, RF11)

- [x] 6.1 Implementar el cálculo de fecha de aviso (`fecha_limite - recordatorio_horas`) y verificación periódica (`checkReminders`) que actualice `notificado = true` en la base de datos al dispararse (30 min).
- [x] 6.2 Integrar el Centro de Avisos (RF11) con lista de avisos activos y programados consultados desde la base de datos. Verificar acción rápida "Marcar hecho" (25 min).

## 7. Reporte de Fallos, Sugerencias y Validación Integral (RF12)

- [x] 7.1 Maquetar el formulario de ayuda/sugerencias e implementar la inserción en la tabla `sugerencias` vinculada al estudiante activo (RF12). Verificar enviando un reporte y viéndolo en la base de datos (25 min).
- [x] 7.2 Ejecutar prueba integral de extremo a extremo cubriendo todos los criterios de aceptación (RF01 a RF12) con base de datos PostgreSQL activa y sin errores en consola ni servidor (30 min).
