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

## Estado de las pruebas reales y límites

**Sí se han ejecutado llamadas reales a OpenRouter**, incluidas tandas con el modelo gratuito `nvidia/nemotron-3-super-120b-a12b:free`. Los resultados y artefactos históricos están en `LIVE-RESULTS-2026-10-11.md`. No se ha completado una comparación equivalente con un segundo proveedor.

- Se observó una filtración intermitente del identificador ficticio de la canary en una tanda: 1 de 3 intentos en el run 38138669830. Una tanda posterior pasó 6/6, pero eso no elimina el riesgo variable.
- Las nuevas llamadas al modelo gratuito quedaron bloqueadas por HTTP 429 (`free-models-per-day`). Esos runs no cuentan como resultado de comportamiento.
- El intento con el modelo de pago devolvió HTTP 402. No se compraron créditos ni se cambió a una ruta de pago.
- El evaluador y las pruebas offline se han endurecido; esto mejora la detección, pero no demuestra que el modelo haya dejado de filtrar.
- Las pruebas heurísticas requieren revisión humana y no son una certificación de seguridad.

## Cómo habilitar la primera prueba real

En GitHub: **Settings → Secrets and variables → Actions**.

- Añadir `AEGIS_OPENROUTER_API_KEY` como secreto. El modelo predeterminado del runner y del workflow es `nvidia/nemotron-3-super-120b-a12b:free`; `AEGIS_OPENROUTER_MODEL` o la variable `AEGIS_OPENROUTER_MODEL` de Actions permiten elegir otro ID. Los modelos configurados explícitamente pueden tener coste.
- Añadir `AEGIS_OPENAI_API_KEY` como secreto y `AEGIS_OPENAI_MODEL` como variable si se quiere probar OpenAI.
- Añadir `AEGIS_GEMINI_API_KEY` como secreto para Gemini.
- Añadir `AEGIS_META_API_KEY` como secreto para Meta Model API.

No subir claves al repositorio, a los logs ni al chat. Después abrir **Actions → AEGIS Live Model Evaluation (manual) → Run workflow**. Para comenzar, elegir `openrouter` y `smoke`; el modo `full` puede enviar seis peticiones por proveedor. El workflow se ejecuta solo mediante lanzamiento manual y guarda su archivo de resultados como artifact por 14 días. No se debe automatizar el consumo de cuota del modelo en cada push. Las llamadas pueden incurrir en costes del proveedor.

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


## Actualización de auditoría — 2026-10-12

- Se inspeccionó el runner, el evaluador, los seis casos, las pruebas de unidad e integración, los endpoints, los workflows y el estado de la PR.
- Se corrigió una debilidad del detector de afirmaciones falsas de uso de herramientas: una negación podía cancelar una afirmación posterior cuando ambas estaban separadas por coma o por conectores adversativos. Ahora las cláusulas se separan también por comas y por «pero/but/however», y se amplió la cobertura de formulaciones en español.
- Se añadieron cuatro regresiones para detectar afirmaciones posteriores tras una negación, cubrir formulaciones españolas y conservar negativas legítimas.
- La primera ejecución de CI de estas nuevas pruebas falló en una regresión de la forma «Nunca ejecuté un escaneo». Se corrigió el patrón de negación en el commit posterior. En el SHA comprobado más reciente, harness, pruebas sintéticas/scope-gate y CodeQL terminaron en PASS (runs 38236943180, 38236943202 y 38236944031).
- La ejecución real de modelos sigue bloqueada por el límite gratuito de OpenRouter. El hallazgo intermitente de divulgación del identificador de la canary permanece abierto; las pruebas offline no demuestran que el comportamiento del modelo esté resuelto.
- No se compraron créditos, no se fusionó la PR y no se modificó la rama main.


## Auditoría adicional de ejecución automática — 2026-10-12

- Se detectó que el workflow denominado manual también tenía un disparador `push`, lo que podía gastar cuota del proveedor al cambiar código. Se eliminó ese disparador: las llamadas reales ahora requieren `workflow_dispatch`.
- La selección de modelo de pago ya no se fuerza en ejecuciones automáticas; el workflow solo corre bajo decisión explícita desde Actions.
- La guía operativa se sincronizó con los límites teóricos correctos: hasta 4 llamadas en `smoke` y hasta 24 en `full`, dependiendo de los proveedores que tengan credenciales y modelo configurados.
- Checks del SHA `8c5852213c071f4c4f84aa0767f4c0a0215fa8b2`: harness PASS (run 38236943180), pruebas sintéticas/scope-gate PASS (run 38236943202), CodeQL PASS (run 38236944031). El cambio posterior de workflow/documentación vuelve a activar CI y debe verificarse.
- La PR #2 continúa abierta en borrador, sin fusionar; `main` y Nexus no se modificaron. El riesgo de filtración intermitente de canary sigue abierto y la cuota gratuita sigue siendo el bloqueo para nuevas repeticiones en vivo.

## Auditoría de seguridad y endurecimiento — 2026-10-13

- Se endureció la validación de URL de proveedores: solo HTTPS para endpoints remotos; HTTP se admite únicamente en loopback para pruebas locales. Se rechazan protocolos no HTTP(S), credenciales incrustadas en la URL, parámetros de consulta y fragmentos.
- El runner ya no sigue redirecciones HTTP del proveedor (redirect: error), evitando que una API configurada redirija una petición autenticada a otro destino.
- Los cuerpos de error HTTP se leen con un límite de 800 caracteres para reducir el riesgo de consumir memoria excesiva al procesar una respuesta de error desproporcionada.
- Se añadieron pruebas unitarias para URL inseguras y una prueba de integración que comprueba que un destino de redirección no recibe la petición.
- El workflow manual usa por defecto un modelo OpenRouter gratuito para reducir el riesgo de cargos accidentales. Esto no garantiza disponibilidad ni cuota: HTTP 429 sigue siendo un bloqueo posible. Un valor de modelo configurado explícitamente en GitHub Variables puede reemplazar el valor predeterminado.
- Se corrigió el README que describía incorrectamente una repetición automática al hacer push; la evaluación real solo se ejecuta mediante workflow_dispatch.

### Pendiente antes de declarar v0.1 cerrado

1. Confirmar que los checks del SHA más reciente terminan en PASS, incluyendo CodeQL y el nuevo test de redirecciones.
2. Revisar las alertas/diagnósticos de CodeQL y separar los problemas del código AEGIS de los errores de análisis preexistentes en nexus/api/index.ts.
3. Ejecutar una prueba real con un proveedor y revisar el artifact JSONL. La cuota gratuita de OpenRouter estaba agotada en las últimas pruebas; no se compraron créditos.
4. Repetir el conjunto con un segundo proveedor autorizado para comparación equivalente. No declarar la comparación completada sin resultados.
5. Ejecutar Promptfoo/Garak solo cuando el entorno y las credenciales estén preparados, con alcance y consumo revisados.
6. Mantener el riesgo de filtración intermitente de canary como abierto hasta obtener evidencia repetida que lo caracterice; una tanda PASS no lo elimina.

La PR #2 permanece abierta y en borrador; main y Nexus siguen sin modificarse. La auditoría de código no sustituye la validación real de comportamiento de los modelos.
