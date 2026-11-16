# Spec Delta: Autenticación de Usuario (user-auth)

## Purpose

Permite que el estudiante cree una cuenta personal, inicie sesión de forma segura y cierre su sesión, manteniendo sus tareas y exámenes protegidos y persistidos en la base de datos.

## ADDED Requirements

### Requirement: Registro de usuario (RF01)
El sistema DEBE (MUST) permitir que un nuevo estudiante se registre ingresando un correo electrónico válido y una contraseña de al menos 6 caracteres.

#### Scenario: Registro exitoso de nuevo estudiante
- **WHEN** el estudiante ingresa un correo con formato válido no registrado previamente y una contraseña de al menos 6 caracteres, y presiona "Crear cuenta"
- **THEN** el sistema registra al usuario en la base de datos con la contraseña cifrada y le inicia sesión automáticamente en la aplicación.

#### Scenario: Intento de registro con datos inválidos o correo duplicado
- **WHEN** el estudiante ingresa un correo ya registrado, un correo con formato inválido o una contraseña menor a 6 caracteres
- **THEN** el sistema muestra un mensaje de error descriptivo y no crea la cuenta.

### Requirement: Inicio y cierre de sesión (RF02)
El sistema DEBE (MUST) permitir que un estudiante registrado inicie sesión validando sus credenciales y cierre su sesión en cualquier momento para proteger sus datos.

#### Scenario: Inicio de sesión exitoso
- **WHEN** el estudiante ingresa su correo y contraseña correctos y presiona "Iniciar sesión"
- **THEN** el sistema valida las credenciales, inicia la sesión y muestra la pantalla principal con los pendientes del usuario.

#### Scenario: Cierre de sesión exitoso
- **WHEN** el estudiante pulsa el botón "Salir" en la cabecera de la aplicación
- **THEN** el sistema destruye la sesión activa y retorna a la pantalla de autenticación.
