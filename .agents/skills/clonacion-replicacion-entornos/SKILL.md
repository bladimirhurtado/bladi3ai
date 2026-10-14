---
name: clonacion-replicacion-entornos
description: Replica repositorios, entornos y plantillas preservando procedencia, secretos, configuración y puntos de recuperación.
---
# Clonación y replicación de entornos
## Flujo
1. Identifica origen, destino, licencia, permisos y qué debe copiarse o excluirse.
2. Registra commit/tag de origen, versiones de runtime y dependencias.
3. Excluye credenciales, tokens, datos privados, cachés y artefactos no necesarios.
4. Replica en un destino nuevo o aislado; nunca sobrescribas el origen por defecto.
5. Valida estructura, configuración de ejemplo, instalación, pruebas y funcionamiento mínimo.
6. Documenta diferencias, limitaciones, procedencia y pasos para actualizar o revertir.
## Reglas
No copies secretos ni datos personales. No afirmes equivalencia completa sin comparar configuraciones y pruebas.