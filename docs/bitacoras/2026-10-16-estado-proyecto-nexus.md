# Bitácora de estado — Nexus / Bladi 3AI
**Fecha:** 2026-10-16  
**Repositorio:** `bladimirhurtado/bladi3ai`  
**Rama:** `feat/agente-desarrollo-skills`  
**PR:** [#11](https://github.com/bladimirhurtado/bladi3ai/pull/11)  
**Último commit verificado antes de esta bitácora:** `582b2c8c8821a743f755d15bb576fc61c7014aaf`

## Estado general
El trabajo de seguridad e integración está registrado en la rama del PR. El PR continúa **abierto**, no fusionado y no desplegado a producción. No fusionar ni desplegar sin autorización explícita.

## Skills
- Añadida `.agents/skills/auditoria-seguridad-aplicaciones/SKILL.md`, skill reutilizable para auditorías autorizadas de código y configuración: SSRF, secretos, validación, CORS, dependencias, abuso de gasto, CI y pruebas reproducibles.
- Skills relevantes existentes: `.agents/skills/agente-desarrollo-skills/SKILL.md` y `.agents/skills/orquestador-multi-ia/SKILL.md`.

## Seguridad de Nexus
- Añadido `nexus/security/url-guard.js`: permite HTTP/HTTPS y rechaza credenciales, fragmentos, puertos no permitidos, destinos locales/privados/especiales; valida respuestas DNS y limita lectura de cuerpos.
- Añadido `nexus/scripts/validate-security-boundaries.mjs` con casos negativos y positivos de validación de URL y DNS.
- `nexus/security/chat-input.js` y `nexus/scripts/validate-chat-input.mjs` validan proveedor/modelo/rol y limitan prompt/contexto.
- Vercel (`nexus/api/index.ts`): URL guard para scraping directo, no sigue redirecciones, timeout de 10 s, descarga directa limitada a 2 MB y CORS controlado por `NEXUS_ALLOWED_ORIGINS`.
- Netlify (`nexus/netlify/functions/api.ts`): valida la URL antes de enviarla a Firecrawl, timeout de 25 s y respuesta de Firecrawl limitada a 2 MB. Las redirecciones del destino dentro de Firecrawl no están controladas directamente por el backend.
- El estado de Firecrawl indica si existe `FIRECRAWL_API_KEY`.
- Riesgos pendientes: el DNS se valida antes de conectar, pero no se fija la IP validada en la conexión; por ello no se elimina por completo el riesgo de DNS rebinding. No hay límites de gasto ni rate limiting robusto a nivel de plataforma; CORS y límites en memoria no bastan frente a abuso distribuido.

## Equipo multi-IA
Roles configurados:
- Arquitectura: `~anthropic/claude-sonnet-latest`
- Investigación: `~google/gemini-flash-latest`
- Programación: `openai/gpt-5.3-codex`
- Crítica de seguridad/calidad: `~deepseek/deepseek-flash-latest`
- Síntesis: `~openai/gpt-latest`

Se añadió `@openrouter/sdk: ^1.2.43` a `nexus/package.json`. Netlify usa el SDK oficial cuando `OPENROUTER_BASE_URL` está inyectado por Netlify AI Gateway, con fallback a llamada directa cuando hay clave propia. Vercel conserva la ruta directa con clave de servidor.

**No se han realizado llamadas pagadas reales a modelos.** La integración pasó build/CI, pero no se ha confirmado todavía que el Gateway y los modelos estén disponibles en runtime ni que el flujo multi-IA funcione de extremo a extremo en vivo.

## CI verificado para el commit previo a esta bitácora
Todos los workflows indicados terminaron en `success`:
- Build Nexus AI Hub: [run 38918219981](https://github.com/bladimirhurtado/bladi3ai/actions/runs/38918219981) — build frontend, bundles/sintaxis backend, pruebas de seguridad, chat-input, contrato de routing multi-IA y `npm audit` sin vulnerabilidades reportadas.
- Validate reusable skills: [run 38918220013](https://github.com/bladimirhurtado/bladi3ai/actions/runs/38918220013).
- Validate Bladi 3AI: [run 38918220044](https://github.com/bladimirhurtado/bladi3ai/actions/runs/38918220044) — 23 paquetes de skills con metadatos/instrucciones básicos y 12 pruebas superadas.
- En una ejecución previa, `npm audit` también reportó 0 vulnerabilidades.

## Entorno de despliegue observado
- Site Netlify: `nexus-ai-hub-wfrk`, ID `ca7c5fbb-b630-4dea-b838-20e6b11899fe`.
- URL informada: https://nexus-ai-hub-wfrk.netlify.app
- La lista de variables consultada no mostraba una clave propia de OpenRouter; eso no demuestra si Netlify AI Gateway inyecta variables durante runtime.
- No se confirmó funcionamiento live mediante prueba end-to-end.

## Siguientes pasos para la prueba controlada
1. Verificar configuración y disponibilidad real del Gateway/credenciales en runtime sin exponer secretos.
2. Antes de cualquier llamada que pueda generar coste, obtener autorización explícita y mantener la prueba mínima.
3. Probar cada rol/modelo y después una tarea completa de extremo a extremo, registrando respuestas y errores reales.
4. Añadir límites de gasto y rate limiting de plataforma; revisar mitigación de DNS rebinding y redirecciones de scraping.
5. Mantener el PR abierto y no desplegar ni fusionar hasta recibir autorización explícita.

## Regla de evidencia
No declarar el equipo multi-IA operativo en vivo hasta que exista una prueba de runtime end-to-end verificable. CI aprobado demuestra validaciones automatizadas, no disponibilidad real de proveedores/modelos.
