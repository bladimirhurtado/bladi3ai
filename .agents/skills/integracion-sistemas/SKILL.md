---
name: integracion-sistemas
description: Integra APIs, servicios externos, autenticación, webhooks y flujos de datos de forma segura y observable.
---
# Integración de sistemas
## Flujo
1. Identifica proveedor, documentación oficial, entorno, contratos de API, límites y modelo de errores.
2. Define esquema de datos, autenticación, permisos mínimos, timeouts, reintentos e idempotencia.
3. Mantén credenciales fuera del código y de los logs; usa variables de entorno o gestor de secretos.
4. Implementa adaptador aislado, validación de entrada/salida y normalización de errores.
5. Prueba éxito, credencial inválida, límite de uso, timeout, respuesta incompleta y caída del proveedor.
6. Documenta configuración, scopes, cuotas, recuperación y rotación de credenciales.
## Reglas
Nunca solicites ni imprimas secretos completos. No des por conectada una API sin una prueba real y autorizada.