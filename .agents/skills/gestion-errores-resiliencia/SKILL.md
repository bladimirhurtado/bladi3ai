---
name: gestion-errores-resiliencia
description: Diagnostica fallos y diseña recuperación segura con límites de reintentos, timeouts y observabilidad.
---
# Gestión de errores y resiliencia
## Flujo
1. Reproduce el fallo y recopila contexto mínimo útil sin exponer secretos.
2. Distingue causa raíz, síntoma, factores contribuyentes y fallos externos.
3. Define timeout, reintento con backoff y jitter, circuit breaker o fallback solo cuando aplique.
4. Evita reintentar operaciones no idempotentes sin protección contra duplicados.
5. Añade mensajes útiles, logs estructurados y métricas sin datos sensibles.
6. Simula fallos y verifica recuperación, degradación controlada y ausencia de bucles infinitos.
## Reglas
No repitas automáticamente una acción destructiva o con coste. Deténte y pide autorización cuando la recuperación pueda afectar datos o cuentas.