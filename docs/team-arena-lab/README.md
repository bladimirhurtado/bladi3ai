# TEAM ARENA LAB — plan operativo verificable

## Estado observado
- Aplicación publicada: https://team-arena-lab-qkz2uh.v2.appdeploy.ai/
- AppDeploy reportó estado `ready`, sin errores de frontend ni de red en la última comprobación.
- Hay modos individual y de revisión cruzada, simulación rotulada, historial local y exportación.
- La comprobación de secretos devolvió una lista vacía. Por tanto, no se ha demostrado todavía una ronda real con OpenRouter.
- Los nombres de modelos configurados en el backend son una configuración propuesta, no evidencia de disponibilidad.

## Equipo configurado en la aplicación
| Rol | Modelo configurado |
|---|---|
| Arquitectura | `openai/gpt-4o-mini` |
| Investigación | `google/gemini-2.5-flash` |
| Ingeniería | `meta-llama/llama-3.3-70b-instruct` |
| Auditoría crítica | `mistralai/mistral-small-3.1-24b-instruct` |
| Síntesis | `moonshotai/kimi-k2` |

La disponibilidad de estos identificadores debe comprobarse mediante una ejecución real. No se garantiza que todos estén habilitados en la cuenta o catálogo actuales.

## Secuencia de avance — sin parálisis
1. **Listo:** comprobar estado de despliegue y errores del frontend.
2. **Bloqueo externo actual:** configurar `OPENROUTER_API_KEY` como secreto de backend, nunca en el chat ni en el frontend.
3. **Después de configurar la clave:** llamar a `GET /api/status`; confirmar que informa `openRouterConfigured: true`.
4. **Prueba mínima real:** enviar una tarea inocua a un modelo y registrar HTTP/estado, modelo, duración y respuesta saneada.
5. **Prueba paralela:** ejecutar los cinco roles con un límite explícito de llamadas y coste.
6. **Prueba de revisión cruzada:** confirmar que la propuesta inicial se conserva incluso si falla la segunda ronda.
7. **Resiliencia:** probar clave ausente, modelo inválido/no disponible, timeout y fallo parcial; no reintentar errores deterministas.
8. **Persistencia:** comprobar historial y exportación JSON, distinguiendo resultados reales de simulados.
9. **Automatización programada:** habilitarla solo después de que las pruebas reales pasen y se establezcan frecuencia, presupuesto máximo y mecanismo de apagado. No programar llamadas pagadas mientras la clave falte.

## Definición de terminado
La función no se considera terminada por compilar o mostrar una respuesta simulada. Se requiere evidencia de una llamada real, atribución de modelo, registro del resultado, manejo de un fallo parcial y prueba de que los secretos no se exponen. Si una prueba no puede ejecutarse por falta de credenciales, se informa como bloqueo concreto y el resto de las pruebas no dependientes se completa por separado.

## Evidencia que debe conservar cada ronda
- ID único de ronda y fecha/hora.
- Modo de ejecución y tarea no sensible.
- Modelo solicitado y modelo reportado por el proveedor.
- Estado por agente: éxito, error, timeout o simulado.
- Duración por llamada; uso/coste solo si el proveedor lo devuelve.
- Resultado de revisión cruzada y discrepancias.
- Pruebas ejecutadas, con salida observable.
- Errores saneados y siguiente acción necesaria.

## Seguridad y gasto
- `OPENROUTER_API_KEY` solo en los secretos del backend.
- No enviar datos personales o secretos a las cinco IA para una prueba inicial.
- La ronda cruzada puede realizar hasta diez llamadas; usar primero una llamada individual y definir presupuesto antes de escalar.
- No crear cron de llamadas pagadas sin aprobación de presupuesto/frecuencia y sin una prueba real exitosa.
