# views-and-filters Specification

## Purpose

Proporciona al estudiante una visualización clara y cronológica de sus compromisos académicos mediante una lista organizada por urgencia, un calendario mensual en cuadrícula y filtros por tipo de pendiente.

## Requirements

### Requirement: Lista cronológica (RF04)
La aplicación DEBE (MUST) mostrar los pendientes ordenados cronológicamente por su fecha límite, agrupándolos visualmente en categorías como 'Vencidos', 'Hoy', 'Mañana', días específicos y 'Completados', además de presentar un banner de alerta destacado si existen pendientes en las próximas 24 horas.

#### Scenario: Visualización de pendientes organizados por fecha y alerta de 24 horas
- **WHEN** el estudiante accede a la pestaña de Lista y tiene pendientes registrados para hoy, mañana o vencidos
- **THEN** la app muestra las tarjetas agrupadas bajo encabezados claros por día, resalta con el acento de alerta (#C03221) los vencidos y muestra un banner destacado si hay entregas pendientes dentro de las próximas 24 horas.

### Requirement: Calendario en cuadrícula (RF07)
La aplicación DEBE (MUST) mostrar un calendario mensual en cuadrícula de lunes a domingo, indicando qué días tienen pendientes mediante puntos de color diferenciados por tipo (acento #7A6F9B para tareas, acento #C03221 para exámenes), y permitiendo seleccionar un día para consultar el detalle de sus pendientes.

#### Scenario: Navegación de mes y selección de día en el calendario
- **WHEN** el estudiante cambia de mes usando las flechas de navegación y selecciona un día con actividades
- **THEN** la cuadrícula actualiza los días del mes correspondiente y el panel inferior despliega la lista de tareas y exámenes programados para ese día específico.

### Requirement: Filtros por tipo de pendiente (RF10)
La aplicación DEBE (MUST) permitir al estudiante filtrar la lista de pendientes según su categoría seleccionando entre 'Todo', 'Tareas' o 'Exámenes'.

#### Scenario: Filtrado de la lista por exámenes
- **WHEN** el estudiante selecciona el filtro 'Exámenes' en la parte superior de la lista
- **THEN** la lista se actualiza inmediatamente mostrando únicamente los pendientes cuyo tipo es examen, ocultando las tareas.

