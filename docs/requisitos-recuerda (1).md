# Recuerda+ — Documento de requisitos

> App móvil para ayudar a estudiantes jóvenes a recordar trabajos y exámenes con anticipación.

---

## 1. Descripción del proyecto

**Recuerda+** es una aplicación móvil dirigida a estudiantes jóvenes que les permite registrar sus tareas y exámenes, verlos en una lista cronológica y en un calendario, y recibir un aviso con anticipación (por defecto, 24 horas antes de la fecha límite).

La idea central es simple: que el estudiante deje de depender de su memoria, de notas sueltas o de mensajes de grupo, y tenga un solo lugar donde ver qué debe entregar o estudiar y para cuándo.

| Elemento | Detalle |
|---|---|
| Tipo de aplicación | Móvil (web móvil en el MVP; publicación como web o app) |
| Usuarios objetivo | Estudiantes jóvenes (escolares y universitarios) |
| Propietario del proyecto | Dueño del proyecto (rol de análisis, revisión y pruebas) |
| Estado actual | MVP funcional en HTML con datos locales |
| Metodología | Cascada con 6 fases: análisis, diseño, desarrollo, pruebas, despliegue y mantenimiento |

---

## 2. Planteamiento del problema

Los estudiantes jóvenes manejan muchas fechas a la vez (tareas, exposiciones, exámenes de varios cursos) y suelen anotarlas de forma dispersa: en el cuaderno, en el chat del grupo, en la memoria o en notas del celular. Esto provoca que:

- Olviden entregas o exámenes, o se acuerden cuando ya no hay tiempo de prepararse.
- No tengan una visión clara de qué es lo más urgente de la semana.
- Pierdan calificaciones y acumulen estrés por la falta de planificación.

**Pregunta de investigación para validar el problema** (entrevista a 5 estudiantes):
*«¿Cómo recuerdas hoy tus tareas y exámenes?»*

---

## 3. Objetivos

### 3.1 Objetivo general

Desarrollar una aplicación móvil que ayude a los estudiantes jóvenes a recordar sus tareas y exámenes con anticipación mediante registro, organización y avisos oportunos.

### 3.2 Objetivos específicos

1. Permitir el registro de tareas y exámenes con título, materia, fecha y hora.
2. Mostrar los pendientes en una lista cronológica y en un calendario en cuadrícula.
3. Enviar un aviso al estudiante 24 horas antes de cada fecha límite.
4. Permitir seguir el avance de cada pendiente mediante estados.
5. Validar la aplicación con estudiantes reales y mejorarla con su retroalimentación.

---

## 4. Alcance

### Incluido en la versión 1.0 (MVP)

- Registro e inicio de sesión con correo y contraseña.
- Gestión de tareas y exámenes (crear, ver, editar, eliminar).
- Lista cronológica y calendario en cuadrícula.
- Estados de avance: pendiente, en progreso, hecho.
- Avisos anticipados (por defecto 24 h antes).

### Fuera de alcance de la versión 1.0

- Integración con plataformas académicas (aulas virtuales, correo institucional).
- Chat o red social entre estudiantes.
- Gamificación (puntos, logros, rachas).

---

## 5. Requisitos funcionales (RF)

Prioridad según el método **MoSCoW**: **Must** (imprescindible), **Should** (importante), **Could** (deseable), **Won't** (no en esta versión).

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF01 | Registro de usuario | El estudiante puede crear una cuenta con correo y contraseña. | Must |
| RF02 | Inicio y cierre de sesión | El estudiante puede ingresar y salir de su cuenta de forma segura. | Must |
| RF03 | Registrar pendiente | El estudiante puede crear una tarea o un examen indicando tipo, título, materia, fecha y hora. | Must |
| RF04 | Lista cronológica | La app muestra los pendientes ordenados por fecha, destacando los vencidos y los de hoy y mañana. | Must |
| RF05 | Estados de avance | Cada pendiente tiene un estado (pendiente, en progreso, hecho) que el estudiante puede cambiar. | Must |
| RF06 | Aviso anticipado | La app genera un aviso 24 horas antes de la fecha límite de cada pendiente no completado. | Must |
| RF07 | Calendario en cuadrícula | La app muestra un calendario mensual con los días que tienen pendientes y permite ver el detalle de cada día. | Should |
| RF08 | Editar y eliminar | El estudiante puede modificar o borrar un pendiente; si cambia la fecha, el aviso se reprograma. | Should |
| RF09 | Aviso configurable | El estudiante puede elegir cuánto antes quiere el aviso (1, 3, 24 o 48 horas). | Should |
| RF10 | Filtros | El estudiante puede filtrar la lista por tipo (todo, tareas, exámenes). | Should |
| RF11 | Centro de avisos | La app muestra los avisos activos y los próximos avisos programados. | Should |
| RF12 | Reporte de fallos y sugerencias | El estudiante puede enviar un reporte o sugerencia mediante un formulario simple. | Should |
| RF13 | Notificaciones push | La app envía notificaciones al dispositivo aunque esté cerrada. | Could |
| RF14 | Recordatorios repetidos | Opción de repetir el aviso si el pendiente sigue sin completarse. | Could |
| RF15 | Modo oscuro | El estudiante puede cambiar el tema visual de la app. | Could |
| RF16 | Integración académica | Importar tareas desde plataformas educativas. | Won't |
| RF17 | Chat entre estudiantes | Mensajería o grupos dentro de la app. | Won't |
| RF18 | Gamificación | Puntos, logros o rachas por cumplir pendientes. | Won't |

---

## 6. Requisitos no funcionales (RNF)

| ID | Categoría | Requisito | Prioridad |
|---|---|---|---|
| RNF01 | Usabilidad | La interfaz es simple, con botones grandes y pensada para usar con una mano en el celular. | Must |
| RNF02 | Confiabilidad | El aviso se genera en el momento correcto: un examen creado para mañana a las 8:00 produce su aviso a las 8:00 de hoy. | Must |
| RNF03 | Seguridad | Las contraseñas se almacenan cifradas (hash) y los datos de cada usuario solo son visibles para él. | Must |
| RNF04 | Diseño móvil | La interfaz se adapta a pantallas de celular (diseño responsive, enfoque *mobile-first*). | Must |
| RNF05 | Rendimiento | La app abre y muestra la lista en menos de 2 segundos con conexión normal. | Should |
| RNF06 | Compatibilidad | Funciona en Android, iOS y en los navegadores móviles más usados. | Should |
| RNF07 | Mantenibilidad | El código está en un repositorio (GitHub) y organizado para agregar mejoras poco a poco. | Should |
| RNF08 | Disponibilidad | La app publicada está accesible de forma continua en un hosting gratuito o equivalente. | Should |
| RNF09 | Accesibilidad | Contraste suficiente y tamaño de letra legible. | Could |
| RNF10 | Uso sin conexión | Permitir consultar los pendientes sin internet. | Could |

---

## 7. Reglas de negocio

1. Un pendiente pertenece a un solo usuario.
2. La fecha del aviso se calcula como: `fecha límite − horas de anticipación`.
3. Un pendiente marcado como **hecho** no genera avisos.
4. Si se cambia la fecha límite o la anticipación de un pendiente, el aviso se reprograma.
5. Los pendientes vencidos y no completados se muestran destacados al inicio de la lista.

---

## 8. Criterios de aceptación principales

| Requisito | Criterio |
|---|---|
| RF01 / RF02 | Un usuario nuevo se registra, entra a la app y, tras salir, puede volver a ingresar con las mismas credenciales. |
| RF03 / RF04 | Un pendiente creado aparece en la lista, en el orden correcto según su fecha. |
| RF06 / RNF02 | Un examen creado para mañana a las 8:00 genera su aviso a las 8:00 de hoy. |
| RF07 | Un día con pendientes aparece marcado en el calendario y muestra su detalle al tocarlo. |

---

## 9. Plan por fases

| Fase | Resultado esperado |
|---|---|
| **Análisis** | Documento de requisitos y lista priorizada MoSCoW (este documento). Entrevista a 5 estudiantes. |
| **Diseño** | Bocetos de pantallas (wireframes) y esquema de la base de datos. |
| **Desarrollo** | Código en GitHub; primero los *Must*, luego los *Should* y *Could*. |
| **Pruebas** | Plan de pruebas y lista de errores corregidos, con 5 estudiantes como probadores. |
| **Despliegue** | App publicada, manual breve y registro de la versión 1.0. |
| **Mantenimiento** | Registro de errores, lista de mejoras y versiones nuevas. |

---

## 10. Roles

| Rol | Responsabilidad |
|---|---|
| Dueño del proyecto | Define requisitos, revisa avances y valida con estudiantes. |
| Diseñador | Crea bocetos y pantallas. |
| Programador | Desarrolla y publica la app. |
| Estudiantes (5 a 8) | Usuarios y probadores: opinan, prueban y reportan fallos. |


erDiagram
    USUARIO ||--o{ MATERIA : "organiza sus cursos en"
    USUARIO ||--o{ PENDIENTE : "registra"
    USUARIO ||--o{ SUGERENCIA : "envia"
    MATERIA |o--o{ PENDIENTE : "clasifica"
    PENDIENTE ||--o{ AVISO : "genera"

    USUARIO {
        uuid id_usuario PK
        string nombre
        string correo UK
        string contrasena_hash
        string tema
        datetime fecha_registro
    }

    MATERIA {
        uuid id_materia PK
        uuid id_usuario FK
        string nombre
        string color
    }

    PENDIENTE {
        uuid id_pendiente PK
        uuid id_usuario FK
        uuid id_materia FK
        string tipo
        string titulo
        string notas
        datetime fecha_hora_limite
        int horas_aviso
        string estado
        datetime fecha_completado
        datetime fecha_creacion
    }

    AVISO {
        uuid id_aviso PK
        uuid id_pendiente FK
        datetime fecha_hora_programada
        datetime pospuesto_hasta
        boolean enviado
        datetime fecha_envio
    }

    SUGERENCIA {
        uuid id_sugerencia PK
        uuid id_usuario FK
        string tipo
        string mensaje
        datetime fecha
    }
    