# Matriz de validación funcional de las 23 skills propias

> **Fecha de diseño:** 2026-10-18. Esta matriz define pruebas reproducibles; no significa que todas se hayan ejecutado. La evidencia real debe registrarse por commit, run, resultado y limitaciones. Solo se eleva la madurez con pruebas ejecutadas.

## Estados
- **M2 — evidencia de prueba aislada:** una prueba reproducible pasó.
- **M1 — inspeccionada/documentada:** instrucciones disponibles, falta prueba de tarea.
- **BLOCKED:** la prueba depende de un secreto, permiso o entorno no disponible.
- Los checks de metadatos del validador no equivalen a eficacia funcional.

| # | Skill | Prueba de aceptación concreta | Evidencia que debe guardarse | Estado al 2026-10-18 |
|---:|---|---|---|---|
| 1 | `investigacion-herramientas` | Comparar tres opciones para una necesidad real; cada recomendación debe incluir fuente primaria, fecha, criterio de coste/limitaciones y contradicciones. | Tabla de decisión con citas, fecha y fuentes descartadas. | M1 — pendiente |
| 2 | `agente-desarrollo-skills` | Inspeccionar/revisar/planificar un repo temporal; clonar un repo Git local temporal a destino nuevo; rechazar credenciales embebidas, esquemas no admitidos y destinos existentes. | CI runs `39150470118`, `39151240372`, `39151274416`; PR #18 añade clonación positiva. | M2 — suite CI pasó |
| 3 | `orquestador-multi-ia` | Enviar un prompt no sensible a cada rol, comprobar modelos realmente respondientes, fallo parcial, síntesis basada solo en respuestas reales y coste. | Log saneado con proveedor/modelo/rol/estado/latencia/coste. | BLOCKED — no hay nombres de secretos configurados en AppDeploy |
| 4 | `ingenieria-software` | Implementar un cambio pequeño en repo de prueba, añadir test de regresión y demostrar que falla antes/pasa después. | Diff, comando de prueba, salida antes/después. | M1 — pendiente |
| 5 | `auditoria-ia-aegis-hydra` | Ejecutar suite sintética de prompt injection, canary, incertidumbre y evidencia contradictoria; revisar falsos positivos y filtraciones. | JSONL de pruebas, hashes, versión y resultados por caso. | M1 — pendiente; live provider test separado |
| 6 | `integracion-sistemas` | Probar adaptador con éxito, credencial inválida, HTTP 429, timeout, respuesta malformada y caída; asegurar que no registra secretos. | Pruebas de contrato y logs saneados. | M1 — pendiente |
| 7 | `control-calidad-qa` | Convertir requisitos de un cambio real en criterios observables y casos positivos, negativos, límites, regresión y recuperación; ejecutar todos los casos. | Matriz requisito→caso→resultado y pasos de reproducción. | M1 — pendiente |
| 8 | `arquitectura-sistemas` | Diseñar un cambio pequeño con componentes, límites de confianza, interfaces, flujos de error y ADR; comprobar que cada requisito se asigna a un componente/test. | ADR, diagrama, contratos y trazabilidad. | M1 — pendiente |
| 9 | `seguridad-optimizacion` | Revisar un proyecto de laboratorio; detectar secreto sintético, permisos excesivos y cuello de botella medible; repetir medición tras cambio. | Hallazgos, severidad, métricas antes/después y regresión. | M1 — pendiente |
| 10 | `gestion-documentacion` | Verificar enlaces/rutas, instrucciones de instalación, ejemplos ejecutables y concordancia entre afirmaciones y CI. | Informe de enlaces, ejemplos y discrepancias corregidas. | M1 — pendiente |
| 11 | `diseno-ui-ux` | Completar una tarea de usuario en móvil y escritorio; probar navegación, estados vacíos/error/carga, foco/teclado y accesibilidad básica. | Pasos, capturas reales del entorno de prueba y defectos. | M1 — pendiente |
| 12 | `gestion-errores-resiliencia` | Inyectar timeout, HTTP 5xx, rate limit y respuesta parcial; comprobar límites de reintento, cancelación, fallback explícito y recuperación. | Tests deterministas, trazas saneadas y conteo de reintentos. | M1 — pendiente |
| 13 | `automatizacion-flujos` | Ejecutar el mismo flujo dos veces; verificar idempotencia, deduplicación, recuperación de un paso fallido y no repetición de efectos externos. | Historial de ejecuciones, claves idempotentes y evidencia de recuperación. | M1 — pendiente |
| 14 | `analisis-datos-metricas` | Analizar dataset sintético con resultado conocido, nulos, duplicados y outliers; comprobar cálculos, denominadores y conclusiones. | Dataset de fixture, script/cálculos y resultados esperados. | M1 — pendiente |
| 15 | `despliegue-configuracion` | Desplegar a staging con secreto ausente y confirmar fallo cerrado; configurar entorno válido, hacer smoke test y demostrar rollback. | Logs de pipeline, URL/versión, smoke tests y rollback. | M1 — pendiente |
| 16 | `seguridad-auditoria-ataque` | Ejecutar pruebas solo contra laboratorio propio con alcance definido; comprobar controles, autorización y no acceso a objetivos externos. | Alcance, casos permitidos/prohibidos, resultados y correcciones. | M1 — pendiente |
| 17 | `ingenieria-inversa-educativa` | Analizar fixture sintético de paquete/archivo: hash, metadatos, cadenas y límites; confirmar que no se ejecuta ni se sube la muestra. | Hash, inventario, salida reproducible y limitaciones. | M1 — pendiente |
| 18 | `refactorizacion-codigo` | Refactorizar módulo pequeño con tests de caracterización; demostrar mismo comportamiento observable y diff limitado al alcance. | Tests antes/después, diff y comparación de salida. | M1 — pendiente |
| 19 | `gestion-dependencias-parches` | Auditar fixture con dependencia vulnerable conocida; aplicar parche compatible, regenerar lockfile y ejecutar pruebas/auditoría posterior. | Informe antes/después, versiones y regresiones. | M1 — pendiente |
| 20 | `diseno-bases-datos` | Diseñar esquema y migración sobre base temporal; probar restricciones, integridad, transacción, migración repetida y rollback cuando corresponda. | Migraciones, fixtures, consultas de validación y resultados. | M1 — pendiente |
| 21 | `clonacion-replicacion-entornos` | Replicar repo/entorno de prueba sin tocar origen; verificar exclusiones, secretos omitidos, manifiestos y comparación de estado. | SHA/commit de origen, destino aislado, diff y lista de exclusiones. | M1 — pendiente |
| 22 | `anatomia-agentes-ia` | Describir componentes/flujo de un agente conocido y separar hechos observados de hipótesis; contrastar el mapa con un caso de prueba. | Mapa de componentes, trazas, supuestos y errores detectados. | M1 — pendiente |
| 23 | `analizador-pro-movil` | Probar APKs sintéticos válidos/corruptos, entradas enormes y extensiones engañosas; comprobar hash, límites, salida y funcionamiento offline sin red. | Fixtures, resultados, uso de memoria/tiempo y errores saneados. | M1 — pendiente |

## Regla de cierre por skill
No marcar una skill como validada solo porque:
- su `SKILL.md` tenga metadatos correctos;
- el repositorio compile;
- una prueba de otra skill haya pasado;
- una aplicación aparezca como `ready`;
- se haya simulado una llamada a un proveedor.

Para cada caso: conservar el fixture o los pasos reproducibles, SHA/commit, ejecución CI/local, resultado, limitaciones y revisión de regresión. Si depende de credenciales o de un sistema externo, registrar el bloqueo sin inventar un resultado.
