# Spec Delta: Gestión de Tareas y Exámenes (task-management)

## Purpose

Permite al estudiante registrar tareas y exámenes con sus detalles correspondientes, actualizar sus datos, cambiar su estado de avance y eliminarlos cuando ya no los necesite.

## ADDED Requirements

### Requirement: Registrar pendiente (RF03)
El sistema DEBE (MUST) permitir crear una tarea o un examen especificando tipo (tarea o examen), título obligatorio (máximo 80 caracteres), materia opcional (máximo 40 caracteres), fecha y hora límite de entrega o evaluación, y tiempo de anticipación del aviso.

#### Scenario: Creación exitosa de tarea o examen
- **WHEN** el estudiante completa el formulario con tipo, título válido, fecha/hora límite y presiona "Guardar"
- **THEN** el sistema guarda el nuevo pendiente asociado al usuario activo con estado inicial 'pendiente' y programa su aviso correspondiente.

#### Scenario: Intento de guardar sin título o sin fecha
- **WHEN** el estudiante intenta guardar un pendiente dejando el título vacío o sin seleccionar fecha y hora
- **THEN** el sistema impide el guardado y muestra un mensaje indicando el campo requerido.

### Requirement: Estados de avance (RF05)
Cada pendiente DEBE (MUST) contar con un estado de avance que solo puede ser uno de tres valores válidos: 'pendiente', 'en progreso' o 'hecho', permitiendo al estudiante alternar su avance fácilmente.

#### Scenario: Cambio cíclico del estado de avance
- **WHEN** el estudiante toca el botón de estado de un pendiente en la lista
- **THEN** el estado avanza en la secuencia 'pendiente' -> 'en progreso' -> 'hecho' -> 'pendiente', actualizando visualmente la tarjeta del pendiente.

### Requirement: Editar y eliminar pendiente (RF08)
El sistema DEBE (MUST) permitir al estudiante modificar los datos de cualquier pendiente existente o eliminarlo definitivamente con confirmación de seguridad.

#### Scenario: Edición de un pendiente con reprogramación de aviso
- **WHEN** el estudiante edita el título, materia o fecha/hora de un pendiente y guarda los cambios
- **THEN** el sistema actualiza la información del pendiente y reprograma el aviso según los nuevos valores.

#### Scenario: Eliminación confirmada de un pendiente
- **WHEN** el estudiante toca el botón de eliminar, confirma la acción cuando se le solicita confirmación y transcurre la validación
- **THEN** el sistema elimina el pendiente definitivamente de la lista y cancela sus avisos asociados.
