---
name: automatizacion-flujos
description: Automatiza tareas repetitivas con scripts y flujos idempotentes, documentados y recuperables.
---
# Automatización de flujos
## Flujo
1. Mapea el proceso actual, entradas, salidas, excepciones y aprobaciones humanas.
2. Elige la automatización más simple compatible con el entorno y las políticas.
3. Valida entradas, evita secretos embebidos y añade modo de simulación cuando haya efectos secundarios.
4. Haz que las operaciones sean idempotentes o detecten duplicados.
5. Añade límites, logs, códigos de salida y recuperación parcial.
6. Prueba en datos ficticios o entorno de ensayo antes de producción.
## Reglas
No automatices envíos, borrados, compras, cambios de permisos o despliegues productivos sin autorización explícita.