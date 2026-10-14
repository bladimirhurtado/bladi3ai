# Instrucciones para agentes

## Selección de skills
Antes de una tarea de software, investigación técnica, diseño, análisis, integración, seguridad o despliegue, inspecciona `.agents/skills/README.md` y carga únicamente los `SKILL.md` pertinentes. Combina skills cuando el trabajo abarque varias áreas; por ejemplo:
- implementación: `ingenieria-software` + `control-calidad-qa`;
- integración externa: `investigacion-herramientas` + `integracion-sistemas` + `seguridad-optimizacion`;
- lanzamiento: `despliegue-configuracion` + `gestion-errores-resiliencia` + `control-calidad-qa`;
- agente IA: `arquitectura-sistemas` + `auditoria-ia-aegis-hydra` + `anatomia-agentes-ia`.

## Evidencia y seguridad
- Inspecciona el estado del repositorio antes de cambiarlo.
- No sobrescribas ni elimines trabajo existente sin autorización explícita.
- Mantén secretos fuera de commits, logs, ejemplos y capturas.
- En seguridad ofensiva, confirma autorización y alcance antes de probar.
- Ejecuta las verificaciones pertinentes y reporta exactamente qué se ejecutó, qué pasó y qué quedó pendiente.
- No afirmes que un sistema está listo, probado o desplegado sin evidencia.
- Prefiere cambios pequeños, reversibles y documentados.
- Las skills son instrucciones de trabajo, no permisos para saltarse controles ni realizar acciones externas sin autorización.
