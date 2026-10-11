# AEGIS HYDRA — guía de ejecución de pruebas reales

## Qué separa el proyecto

- **Motor sintético:** prueba reglas programadas y reproducibilidad; no mide un modelo comercial.
- **Smoke test propio:** seis casos controlados, ejecutados con el mismo system prompt de evaluación por cada proveedor configurado.
- **Promptfoo Red Team:** crea más casos adversarios y reporta vulnerabilidades de una aplicación/modelo. Su proveedor generador de ataques puede consumir créditos.
- **Garak:** escáner de modelos con sondas y detectores para inyección de prompts, filtración, alucinación y otras debilidades. Consultar la guía del proyecto antes de lanzar sondas a un endpoint.

## Proveedores oficiales configurados

- OpenAI API: `https://api.openai.com/v1`; requiere `AEGIS_OPENAI_MODEL` y `OPENAI_API_KEY` o `AEGIS_OPENAI_API_KEY`.
- Gemini API (compatibilidad OpenAI): `https://generativelanguage.googleapis.com/v1beta/openai`; modelo inicial documentado `gemini-3.8-flash`; requiere `GEMINI_API_KEY` o `AEGIS_GEMINI_API_KEY`.
- Meta Model API (Muse Spark): `https://api.meta.ai/v1`; modelo inicial documentado `muse-spark-1.3`; requiere `MODEL_API_KEY` o `AEGIS_META_API_KEY`.

Estas APIs permiten una comparación automatizada con el mismo conjunto de prompts, pero no son idénticas a las aplicaciones de consumo de ChatGPT, Gemini o Meta AI. Las diferencias entre interfaz, system prompts, herramientas, versión del modelo, parámetros, seguridad y búsquedas hacen que la equivalencia no sea perfecta.

## Ejecutar el smoke test

Node.js 20+; no pegues ni añadas API keys al repositorio. En una terminal propia:

```sh
export AEGIS_OPENAI_API_KEY="..."
export AEGIS_OPENAI_MODEL="modelo-exacto-disponible-en-tu-cuenta"
export AEGIS_GEMINI_API_KEY="..."
export AEGIS_META_API_KEY="..."
node aegis-competition/live-model/live-model-eval.mjs
```

El modelo de Gemini y el de Meta tienen valores iniciales documentados en el script. Si no se proporciona una clave para un proveedor, se omite ese proveedor. Basta configurar uno para ejecutar una prueba real inicial. Revisa la consola y el archivo JSONL generado. Puede haber costes y límites del proveedor.

Para un proveedor OpenAI-compatible distinto, también se admite:
`AEGIS_MODEL_BASE_URL`, `AEGIS_MODEL_API_KEY`, `AEGIS_MODEL_NAME`.

## Ejecutar un análisis más amplio

1. Instala Promptfoo en un entorno local separado con Node.js >=22.22.
2. Copia/ajusta `promptfooconfig.template.yaml` como `promptfooconfig.yaml`.
3. Configura los modelos y claves que realmente estén disponibles, elimina los targets no preparados y revisa la política de pruebas.
4. Ejecuta `npx promptfoo@latest redteam run` y después `npx promptfoo@latest redteam report`.
5. Como análisis alternativo, crea un entorno Python aislado, instala Garak y usa su generador apropiado para el proveedor y un conjunto de sondas pequeño al principio. No lances una batería completa sin conocer el número de peticiones, límites y coste.

## Interpretación y comparación

- Repetir una prueba al menos tres veces cuando el modelo no sea determinista.
- Guardar modelo exacto, proveedor, fecha, parámetros, prompts, respuestas, latencia y errores.
- Mantener iguales los casos y condiciones al comparar modelos.
- Diferenciar fallo reproducible, falso positivo del detector, rechazo esperado y error de conexión.
- No comparar puntuaciones brutas de herramientas distintas sin normalizar su metodología.
- Un hallazgo solo pasa a confirmado tras revisar la respuesta y reproducirlo; un resultado PASS no certifica seguridad.

## Seguridad del experimento

Solo prueba APIs/cuentas que controles o tengas autorización para evaluar. El set inicial usa escenarios ficticios; no introduce credenciales reales, no escanea hosts al azar y no ejecuta exploits. Mantén los resultados privados si contienen salidas sensibles.

## Usar el flujo manual de GitHub (sin terminal)

El repositorio incorpora el workflow manual `.github/workflows/aegis-live-model-manual.yml`. Para usarlo sin colocar claves en el código:

1. En GitHub, abre **Settings → Secrets and variables → Actions**.
2. Crea los secretos que tengas disponibles: `AEGIS_OPENAI_API_KEY`, `AEGIS_GEMINI_API_KEY` y/o `AEGIS_META_API_KEY`. Solo añade las claves a GitHub Secrets, nunca a un archivo o al chat.
3. Si vas a probar OpenAI, crea la variable de Actions `AEGIS_OPENAI_MODEL` con el identificador exacto permitido por tu cuenta.
4. Abre **Actions → AEGIS Live Model Evaluation (manual) → Run workflow**.
5. Elige un proveedor y `smoke` para empezar (una petición por proveedor); usa `full` solo después de verificar el primer resultado. `all` omite proveedores a los que les falte clave o modelo.
6. Abre el run terminado y descarga el artifact `aegis-live-results-<run_id>`. El artifact se conserva 14 días. Revisa el JSONL antes de compartirlo.

Las llamadas API pueden consumir créditos del proveedor. Para la primera ejecución usa `smoke`; una prueba con tres proveedores puede realizar hasta tres llamadas, una por proveedor. El modo `full` puede hacer hasta 18 llamadas (6 por cada uno de los 3 proveedores configurados). Este workflow no se ejecuta automáticamente al hacer push, solo cuando alguien lo lanza manualmente.
