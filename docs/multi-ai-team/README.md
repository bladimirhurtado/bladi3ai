# Equipo multi-IA de Nexus

## Objetivo
Nexus ya tenía un modo Equipo, pero sus cuatro etapas llamaban al mismo modelo OpenRouter. Esta mejora asigna modelos distintos a arquitectura, investigación, crítica y síntesis para conseguir una segunda opinión real, manteniendo una clave de API en el backend.

## Arquitectura

```text
Solicitud del usuario
       |
       v
Backend Nexus (/api/team)
       |---- Arquitectura ---- Claude vía OpenRouter
       |---- Investigación --- Gemini vía OpenRouter
       |---- Programación ---- GPT-5.3-Codex vía OpenRouter
       |---- Crítica de seguridad/calidad -- DeepSeek vía OpenRouter
       |---- Síntesis -------- GPT vía OpenRouter
       |
       v
Respuesta + atribución de modelos + advertencias
```

Los nombres son valores predeterminados de configuración, no una garantía de disponibilidad del catálogo. Se pueden cambiar sin editar código mediante estas variables de entorno:

- `OPENROUTER_API_KEY`: clave solo del lado servidor.
- `NEXUS_ALLOWED_ORIGINS`: lista separada por comas de orígenes web autorizados para el backend Vercel; por defecto, `https://nexus-ai-hub-wfrk.netlify.app`. Añade el origen exacto del frontend si es distinto.
- `NEXUS_TEAM_ARCHITECT_MODEL`: por defecto `~anthropic/claude-sonnet-latest`.
- `NEXUS_TEAM_RESEARCHER_MODEL`: por defecto `~google/gemini-flash-latest`.
- `NEXUS_TEAM_CODER_MODEL`: por defecto `openai/gpt-5.3-codex`.
- `NEXUS_TEAM_CRITIC_MODEL`: por defecto `~deepseek/deepseek-flash-latest`.
- `NEXUS_TEAM_SYNTHESIS_MODEL`: por defecto `~openai/gpt-latest`.

## Ejecución
1. Configurar `OPENROUTER_API_KEY` en las variables de entorno del proveedor de despliegue (Netlify o Vercel); no añadirla a Git.
2. Confirmar que la cuenta de OpenRouter tiene acceso a los modelos configurados y que hay saldo/límites apropiados.
3. Desplegar desde la rama de trabajo.
4. Abrir Nexus, seleccionar **Equipo Nexus**, enviar una tarea no sensible y comprobar que la salida atribuye cada rol al modelo configurado.
5. Revisar los errores parciales; no interpretar un nombre de modelo configurado como prueba de que respondió correctamente.

## Coste y privacidad
El modo Equipo realiza hasta cinco llamadas de modelo por ejecución (cuatro colaboradores en paralelo y una síntesis si responden al menos tres), más búsqueda web opcional. Esto puede costar más que una conversación normal. Cada llamada recibe el prompt y el contexto web proporcionado; no enviar secretos ni información sensible. La app no almacena la clave en el navegador. No hay llamada real demostrada hasta probar el despliegue con una clave válida.

## Seguridad operativa
- El endpoint de scraping valida que el destino use HTTP/HTTPS, rechaza hosts/IPs locales o privados, bloquea redirecciones en Vercel, limita el tiempo de espera y acota el cuerpo leído.
- El backend Vercel rechaza orígenes de navegador que no estén en `NEXUS_ALLOWED_ORIGINS`; esto no reemplaza autenticación ni limitación de solicitudes en la plataforma.
- Antes de uso público, configura rate limiting/cuotas en el proveedor de despliegue y límites de gasto en OpenRouter. No se pueden demostrar desde CI.

## Límites
- No se copian ni descargan los pesos de Claude, Gemini, DeepSeek o GPT. Nexus los consume por API.
- El código puede pasar CI sin que eso demuestre que las credenciales o el acceso a modelos funcionen.
- Las salidas son sugerencias de modelos; el coordinador debe verificarlas con código, fuentes y pruebas.
