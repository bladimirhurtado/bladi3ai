# AEGIS HYDRA — Estado de la etapa 3

Fecha de corte: 2026-10-11  
Rama: `aegis-live-model-v0.1`  
PR: https://github.com/bladimirhurtado/bladi3ai/pull/2  
Estado de integración: abierta en borrador, sin fusionar.

## Qué está construido

- Ejecutor real por API OpenAI-compatible para OpenRouter, OpenAI API, Gemini API, Meta Model API (Muse Spark 1.3) y endpoints personalizados compatibles.
- Selector de proveedor y tamaño de suite: `AEGIS_PROVIDERS` y `AEGIS_CASE_LIMIT`. El modo `smoke` del workflow manual limita la primera prueba a un caso por proveedor; `full` ejecuta los seis casos.
- Seis casos: secreto ficticio, prompt injection en texto citado, extracción de instrucciones, calibración de incertidumbre, contradicciones y afirmaciones falsas de uso de herramientas.
- Registro JSONL con proveedor/modelo, prompt/respuesta, latencia, errores y SHA-256 por registro.
- Evaluador heurístico en español e inglés, pruebas unitarias, pruebas de rutas de API y prueba de integración end-to-end contra una API simulada en loopback.
- Plantilla de Promptfoo Red Team, guía operativa en español, workflow manual para modelos reales y workflow CodeQL para análisis estático del código.

## Verificaciones realizadas

- Workflow **AEGIS Live Model Harness Checks**: PASS. Ejecutó sintaxis, pruebas de evaluador/rutas, validación JSON, comprobación del workflow manual/CodeQL y rechazo cuando no se suministran credenciales.
  Resultado: https://github.com/bladimirhurtado/bladi3ai/actions/runs/38102043457
- Workflow **AEGIS synthetic and scope-gate tests**: PASS. La batería sintética/adversaria y los controles del ejecutor original siguen pasando.
  Resultado: https://github.com/bladimirhurtado/bladi3ai/actions/runs/38102043313
- Workflow **AEGIS CodeQL Security Scan**: finalizó correctamente y subió resultados de análisis.
  Resultado: https://github.com/bladimirhurtado/bladi3ai/actions/runs/38102043359

## Hallazgo de cobertura fuera de AEGIS

CodeQL informó errores de análisis sintáctico en el archivo existente `nexus/api/index.ts` (líneas 8, 14 y 17, entre otras posiciones de esas líneas). El SHA del archivo es idéntico en `aegis-live-model-v0.1` y `aegis-competition-v0.4`: este trabajo no lo modificó. Los mensajes señalan expresiones/registros que CodeQL no pudo analizar; reducen la cobertura y merecen una revisión independiente en la rama/proyecto de Nexus. No se ha modificado Nexus para mantener separados los proyectos.

El estado "success" de CodeQL indica que el análisis y la carga SARIF acabaron correctamente; no equivale a afirmar que se encontró cero vulnerabilidades. La salida de diagnóstico también advierte de archivos que no pudo analizar.

## Qué NO se ha probado todavía

**No se ha realizado ninguna llamada a una API comercial real.** No hay claves configuradas en los secretos del repositorio, así que todavía no hay resultados en vivo de OpenRouter, OpenAI, Gemini o Meta. La integración local simulada solo valida el ejecutor y el registro de evidencias; no mide seguridad o calidad de ningún modelo comercial.

Los resultados de los detectores heurísticos sirven para triaje, no para una certificación. Los hallazgos deben revisarse manualmente y repetirse para descartar falsos positivos.

## Cómo habilitar la primera prueba real

En GitHub: **Settings → Secrets and variables → Actions**.

- Añadir `AEGIS_OPENROUTER_API_KEY` como secreto. El modelo predeterminado es `openai/gpt-oss-120b`; `AEGIS_OPENROUTER_MODEL` permite elegir otro ID disponible.
- Añadir `AEGIS_OPENAI_API_KEY` como secreto y `AEGIS_OPENAI_MODEL` como variable si se quiere probar OpenAI.
- Añadir `AEGIS_GEMINI_API_KEY` como secreto para Gemini.
- Añadir `AEGIS_META_API_KEY` como secreto para Meta Model API.

No subir claves al repositorio, a los logs ni al chat. Después abrir **Actions → AEGIS Live Model Evaluation (manual) → Run workflow**. Para comenzar, elegir `openrouter` y `smoke`; el modo `full` puede enviar seis peticiones por proveedor. El workflow manual no corre en cada push y guarda su archivo de resultados como artifact por 14 días. Las llamadas pueden incurrir en costes del proveedor.

Endpoints/modelos configurados según documentación oficial:
- Gemini API compatible: https://ai.google.dev/gemini-api/docs/openai — `gemini-3.8-flash`.
- Meta Model API: https://dev.meta.ai/docs/cookbook/quickstart-chat-completions — `https://api.meta.ai/v1`, modelo `muse-spark-1.3`.
- Promptfoo Red Team: https://www.promptfoo.dev/docs/red-team/quickstart/
- Garak LLM vulnerability scanner: https://github.com/NVIDIA/garak

## Gate para cerrar v0.1

1. Ejecutar un smoke real con al menos un proveedor.
2. Revisar el artifact JSONL: estado HTTP, respuestas, latencias, hash de registros y falsos positivos.
3. Ejecutar el mismo conjunto con segundo proveedor en iguales condiciones.
4. Probar Promptfoo con credenciales y targets que realmente estén disponibles; empezar con ocho pruebas y concurrencia uno.
5. Revisar por separado el diagnóstico preexistente de Nexus, sin mezclar ni fusionar esa corrección con AEGIS.
6. Mantener PR #2 sin fusionar hasta revisar la evidencia real y el estado del scan.
