# Spec Delta: Reporte de Fallos y Sugerencias (feedback)

## Purpose

Permite al estudiante enviar reportes de errores técnicos o sugerencias de mejora desde la aplicación, además de consultar el historial de los mensajes que ha enviado.

## ADDED Requirements

### Requirement: Reporte de fallos y sugerencias (RF12)
El sistema DEBE (MUST) proporcionar un formulario en la pestaña de Ayuda que permita al estudiante seleccionar el tipo de reporte ('fallo' o 'mejora'), redactar un mensaje de al menos 5 caracteres (hasta 500 caracteres), registrarlo en la base de datos y visualizar sus envíos anteriores con tipo, fecha y texto.

#### Scenario: Envío exitoso de sugerencia o reporte
- **WHEN** el estudiante selecciona un tipo ('fallo' o 'mejora'), escribe un texto de al menos 5 caracteres y presiona "Enviar"
- **THEN** el sistema almacena el registro en la base de datos vinculada al usuario, muestra un mensaje de confirmación ("¡Gracias! Recibimos tu mensaje.") y actualiza la sección de envíos recientes.

#### Scenario: Validación de longitud mínima de mensaje
- **WHEN** el estudiante intenta enviar el formulario con un mensaje vacío o menor a 5 caracteres
- **THEN** el sistema impide el envío y muestra el mensaje de error "Escribe al menos 5 caracteres."
