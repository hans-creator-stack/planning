# Spec Delta: Sistema de Avisos Anticipados (reminders)

## Purpose

Calcula de forma automática y determinista los recordatorios de tareas y exámenes según la anticipación seleccionada por el estudiante, mostrando avisos activos, avisos programados y notificando dentro de la aplicación y en el dispositivo.

## ADDED Requirements

### Requirement: Aviso anticipado (RF06)
La aplicación DEBE (MUST) generar automáticamente un aviso cuando el momento actual alcanza o supera la fecha programada para el recordatorio de un pendiente no completado (calculada por defecto 24 horas antes de la fecha límite).

#### Scenario: Disparo de aviso anticipado para un examen
- **WHEN** se alcanza la fecha de recordatorio de un pendiente no completado
- **THEN** la app muestra un aviso visual destacado tipo toast con el tipo y título del pendiente, incrementa el contador de avisos en la barra de navegación y emite una notificación del navegador si los permisos están concedidos.

#### Scenario: Pendiente marcado como hecho no dispara aviso
- **WHEN** un pendiente se encuentra con estado 'hecho' al cumplirse su hora de aviso programada
- **THEN** el sistema no genera ningún aviso ni notificación para dicho pendiente.

### Requirement: Aviso configurable (RF09)
La aplicación DEBE (MUST) permitir al estudiante seleccionar la anticipación del aviso al crear o editar un pendiente entre cuatro opciones predeterminadas: 1 hora, 3 horas, 24 horas (opción por defecto) o 48 horas antes de la entrega.

#### Scenario: Configuración de anticipación personalizada a 3 horas
- **WHEN** el estudiante selecciona la opción "3 horas antes" en el selector de aviso y guarda el pendiente
- **THEN** el sistema calcula la fecha exacta del aviso restando 3 horas a la fecha límite indicada (`fecha_límite - 3 horas`).

### Requirement: Centro de avisos (RF11)
La aplicación DEBE (MUST) disponer de una pestaña dedicada de avisos donde el estudiante pueda consultar los avisos activos (pendientes cuyo recordatorio ya se activó y siguen sin completarse) y los próximos avisos programados con su fecha y hora exactas de disparo.

#### Scenario: Consulta y resolución de avisos en el centro de avisos
- **WHEN** el estudiante ingresa a la pestaña "Avisos" y presiona "Marcar hecho" en una tarjeta de aviso activo
- **THEN** el pendiente cambia su estado a 'hecho', desaparece de la lista de avisos activos y se decrementa el indicador numérico de la pestaña.
