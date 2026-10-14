---
name: gestion-dependencias-parches
description: Gestiona dependencias y parches evaluando compatibilidad, vulnerabilidades, licencias y posibilidad de reversión.
---
# Gestión de dependencias y parches
## Flujo
1. Inventaría manifiestos, lockfiles, runtime y dependencias directas/transitivas.
2. Comprueba avisos de seguridad y notas de versión en fuentes oficiales.
3. Evalúa compatibilidad, cambios incompatibles, licencia, mantenimiento y cadena de suministro.
4. Actualiza en una rama aislada y conserva lockfiles coherentes.
5. Ejecuta pruebas, build, escáneres disponibles y comprobaciones de licencia.
6. Registra motivo, versiones antes/después, riesgo y rollback.
## Reglas
No actualices todo a ciegas ni elimines lockfiles para resolver conflictos. No afirmes que una dependencia es segura solo porque es popular.