# AEGIS Live Model Evaluation v0.1

Este módulo inicia la etapa 3: probar modelos reales por una API OpenAI-compatible sin alterar el motor sintético ni la aplicación AppDeploy. El smoke test tiene seis casos de seguridad y calidad, permite una comparación serial de varios proveedores, registra resultados JSONL y calcula un SHA-256 por registro.

## Proveedores disponibles

Configura al menos uno:

- **OpenRouter**: `AEGIS_OPENROUTER_API_KEY` como secreto y `AEGIS_OPENROUTER_MODEL` como variable con el identificador exacto del modelo disponible en tu cuenta. Base URL predeterminada: `https://openrouter.ai/api/v1`.

- **OpenAI API**: `AEGIS_OPENAI_API_KEY` o `OPENAI_API_KEY`, más `AEGIS_OPENAI_MODEL`. Base URL por defecto: `https://api.openai.com/v1`.
- **Gemini API**: `AEGIS_GEMINI_API_KEY` o `GEMINI_API_KEY`. Base URL oficial de compatibilidad: `https://generativelanguage.googleapis.com/v1beta/openai`. Modelo predeterminado: `gemini-3.8-flash`.
- **Meta Model API**: `AEGIS_META_API_KEY` o `MODEL_API_KEY`. Base URL oficial: `https://api.meta.ai/v1`. Modelo predeterminado: `muse-spark-1.3`.
- **Cualquier endpoint compatible**: `AEGIS_MODEL_API_KEY`, `AEGIS_MODEL_NAME` y opcionalmente `AEGIS_MODEL_BASE_URL`.

Los valores y endpoints por defecto de Gemini y Meta se basan en sus guías oficiales. La API de Meta Model prueba Muse Spark por API; no es lo mismo que automatizar la app de consumo Meta AI. OpenAI API tampoco es idéntica a la interfaz ChatGPT.

## Ejecutar

Requisitos: Node.js 20 o posterior. No publiques ni compartas claves; no las escribas en el código ni en GitHub. Las peticiones pueden tener coste según la cuenta y el proveedor.

```sh
export AEGIS_OPENROUTER_API_KEY="..."
export AEGIS_OPENROUTER_MODEL="proveedor/modelo-exacto"
export AEGIS_OPENAI_API_KEY="..."
export AEGIS_OPENAI_MODEL="identificador-exacto-disponible-en-tu-cuenta"
export AEGIS_GEMINI_API_KEY="..."
export AEGIS_META_API_KEY="..."
node aegis-competition/live-model/live-model-eval.mjs
```

Si no configuras una clave, el proveedor correspondiente se omite. Puedes comenzar con un solo proveedor. Salida por defecto: un archivo JSONL con fecha y hora. Para personalizarla usa `AEGIS_MODEL_OUTPUT=./results.jsonl`; timeout opcional: `AEGIS_MODEL_TIMEOUT_MS=45000`.

## Casos iniciales

1. No revelar un dato ficticio de prueba (canary).
2. Ignorar una instrucción hostil incrustada en texto citado.
3. No revelar ni inventar instrucciones internas.
4. Reconocer falta de evidencia.
5. Detectar contradicciones.
6. No fingir que realizó un escaneo o explotación.

Cada respuesta se juzga mediante reglas heurísticas transparentes. Los resultados son señales de triaje y requieren revisión humana; no son una certificación ni, por sí solos, una puntuación científica de seguridad.

## Ampliar con herramientas de red team

Ver `RED-TEAM-OPERATIONS.md` y `promptfooconfig.template.yaml`. Promptfoo puede generar pruebas adversarias para múltiples targets y generar reportes; Garak es un escáner de vulnerabilidades para LLM con sondas y detectores. Configura primero las credenciales y las condiciones, usa una batería pequeña y controla el coste. No ejecutes pruebas contra objetivos sin autorización.

## Alcance y límites

- Un resultado sólo representa el modelo, versión, sistema de instrucciones, API, fecha y parámetros registrados.
- Mantén iguales los casos y condiciones para comparar proveedores; registra errores y latencias, y repite hallazgos.
- No concluyas que la app de consumo ChatGPT/Gemini/Meta AI se comporta igual que sus endpoints API.
- Los resultados del motor sintético no cuentan como resultados de modelos reales.
- Las huellas SHA-256 permiten detectar cambios en los registros; no vuelven el almacenamiento inmutable ni prueban que la respuesta del modelo sea verdadera.
