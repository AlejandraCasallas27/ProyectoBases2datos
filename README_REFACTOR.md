# VetCare — modelo simplificado y modular

## Cambios
- 11 tablas a 6: `user`, `pet`, `service`, `appointment`, `review`, `medical_record`.
- `adminService` ya no concentra recursos; usuarios y mascotas tienen módulos propios.
- Las etiquetas de reseñas se guardan como JSON y los detalles clínicos como JSON.
- Los nombres de tablas en repositorios se cambiaron a singular.
- Las rutas REST conservan la estructura por recursos.

## Instalación sin destruir los datos anteriores
1. Haz una copia de seguridad de MySQL y de tu proyecto original.
2. En MySQL Workbench ejecuta `database/schema_v2.sql` (crea la base `vetcare_v2`).
3. Ejecuta `database/migrate_data.sql` **una sola vez**, con `vetcare_v2` vacía. No ejecutes dos veces.
4. Ejecuta `database/check_migration.sql` y confirma que los seis conteos coinciden.
5. Copia `.env.example` como `.env`, configura tus valores locales y usa `DB_NAME=vetcare_v2`.
6. `npm install`, `node src/app.js` y revisa `/api-docs`.
7. Ejecuta en Swagger todos los endpoints con propietario y administrador; conserva capturas de respuestas y errores.

## Notas de compatibilidad
- Los detalles clínicos conservan el formato de respuesta original, aunque se guardan en una sola tabla.
- Las etiquetas originales se migran con sus nombres e identificadores al JSON de cada reseña. Para **nuevas** reseñas, `tagIds` se almacena como identificadores sin nombre; el catálogo independiente se eliminó. Si el profesor exige nombres de etiquetas nuevas, se debe definir un catálogo en código o conservar una tabla `review_tag` (7 tablas).
- La base anterior `vetcare` no se modifica ni se borra.
- Las fechas de las citas se almacenan como DATETIME local de Colombia. Las consultas convierten UTC al horario UTC-05:00 para las comparaciones; esto supone operación en Colombia.
- Esta entrega pasó validación de sintaxis JS, pero requiere pruebas funcionales con tu instancia MySQL.
- El proyecto académico utiliza contraseñas en texto plano; para producción deben reemplazarse por hashes y controles adicionales.
