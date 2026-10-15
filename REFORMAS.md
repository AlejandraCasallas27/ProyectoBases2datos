# Refactorización modular de VetCare (fase 1)

Esta copia excluye `.env`, `node_modules` y archivos de credenciales.

## Cambios implementados
- Operaciones de usuarios trasladadas a `userController`, `userService` y `userRepository`.
- Operaciones de mascotas trasladadas a `petController`, `petService` y `petRepository`.
- Eliminado el módulo `admin` como recurso; permisos de administrador se mantienen en rutas de `user` y `pet`.
- Swagger actualizado a las nuevas rutas. Se documentan 23 operaciones: las dos consultas GET de mascotas (propietario y administrador) se unificaron en una sola ruta con permisos por rol.
- Las rutas de administración anteriores `/api/v1/admin/...` fueron reemplazadas por `/api/v1/users/...` y `/api/v1/pets/...`.

## Pendiente: fase 2 de base de datos
El esquema SQL actual NO se ha cambiado. Renombrar tablas y fusionar registros clínicos requiere una migración segura de datos y actualizar todos los repositorios. No ejecutar DROP TABLE sobre la base original.

## Ejecución
1. Crear `.env` local desde la configuración existente, sin publicarlo.
2. `npm install`
3. `node src/app.js`
4. Revisar `http://localhost:3000/api-docs/`.

## Pruebas necesarias
Comprobar autenticación, rutas de usuarios/mascotas con propietario y administrador, respuesta 403 sin permisos, y el resto de endpoints. Este paquete fue validado sintácticamente, pero no se ejecutó contra MySQL.
