# BLADI REPLICA ENGINE

Motor modular de análisis y reconstrucción funcional clean-room, integrado en Bladi 3AI / REA. Versión **0.2.0**.

## Capacidades

- Flujo de 11 etapas: reconocimiento, arquitectura, diseño, construcción, backend, pruebas, comparación funcional, análisis de usuarios, identidad, lanzamiento y despliegue.
- Adaptador local Ollama y adaptador genérico para endpoints compatibles con OpenAI Chat Completions.
- Enrutador con failover secuencial: si un proveedor falla, intenta el siguiente proveedor elegible.
- Los proveedores remotos requieren configuración explícita y la bandera `--allow-remote` en cada ejecución.
- Memoria local JSONL por proyecto; sin sincronización cloud automática.
- `run-stage` genera un borrador y NO marca una etapa como completada hasta revisión humana.
- Solo biblioteca estándar de Python: sin `pip`, API de pago ni claves obligatorias.

## Requisitos

Python 3.8+. Para generación local, instala Ollama por tu cuenta y descarga un modelo compatible. La instalación del motor no descarga modelos.

## Inicio rápido en Termux / Linux

Desde la raíz del repositorio:

```bash
python -m bladi_replica_engine.cli init --workspace ./workspaces --name mi-app --target https://ejemplo.com
python -m bladi_replica_engine.cli providers
python -m bladi_replica_engine.cli run-stage ./workspaces/mi-app
python -m bladi_replica_engine.cli status ./workspaces/mi-app
```

El primer proveedor predeterminado es Ollama local en `http://127.0.0.1:11434`, modelo `llama3.2`. Cambia el modelo según el que tengas instalado.

## Configuración opcional

Variables de entorno:

- `BLADI_OLLAMA_URL` (predeterminado `http://127.0.0.1:11434`)
- `BLADI_OLLAMA_MODEL` (predeterminado `llama3.2`; usa `off` para desactivarlo)
- `BLADI_OPENAI_COMPATIBLE_URL`
- `BLADI_OPENAI_COMPATIBLE_MODEL`
- `BLADI_OPENAI_COMPATIBLE_API_KEY` (opcional según el proveedor)
- `BLADI_AI_ORDER` (predeterminado `ollama,openai-compatible`)
- `BLADI_AI_TIMEOUT` (segundos; limitado entre 5 y 300)

El endpoint remoto solo se utiliza si se configuran URL y modelo y se añade `--allow-remote` al comando. No se muestran ni registran claves. No guardes claves en Git ni en archivos del proyecto.

Ejemplo remoto explícito:

```bash
export BLADI_OPENAI_COMPATIBLE_URL="https://proveedor.example/v1"
export BLADI_OPENAI_COMPATIBLE_MODEL="modelo"
export BLADI_OPENAI_COMPATIBLE_API_KEY="TU_CLAVE"
python -m bladi_replica_engine.cli ask --text "Resume este texto" --allow-remote
```

## Comandos

- `providers`: lista proveedores configurados sin mostrar secretos.
- `ask --text "..."` o `ask --prompt-file archivo.md`: consulta un proveedor.
- `ask --project-dir RUTA --save`: añade solicitud y respuesta a la memoria local.
- `run-stage RUTA`: prepara y ejecuta la etapa actual, guarda `outputs/drafts/<etapa>-draft.md` y conserva estado pendiente de revisión.
- `complete RUTA --stage recon --result archivo.md`: registra un resultado revisado y avanza.
- `status RUTA` y `manifest RUTA`: inspección del progreso.

Ejemplo para terminar una etapa después de revisar el borrador:

```bash
python -m bladi_replica_engine.cli complete ./workspaces/mi-app --stage recon --result ./workspaces/mi-app/outputs/drafts/recon-draft.md
```

## Privacidad, seguridad y límites

- El modo local no envía prompts a Internet. El modo remoto requiere `--allow-remote` explícito.
- La memoria se guarda en `memory.jsonl` dentro del proyecto; puede contener información sensible. No la subas a repositorios públicos.
- El motor no ejecuta código generado, no instala dependencias, no inicia sesión en sitios, no evade controles de acceso ni publica/despliega automáticamente.
- Solo fuentes públicas o materiales autorizados; crea implementaciones y activos originales.
- Los resultados de IA son borradores, no hechos verificados. Revisa fuentes, licencias, seguridad y precisión antes de usarlos.
- No se garantiza paridad perfecta ni compatibilidad con todos los proveedores: se requiere un endpoint Chat Completions compatible.

## Pruebas

```bash
python -m unittest discover -s tests -p 'test_bladi_replica*.py' -v
```
