# Registro maestro de herramientas, skills y agentes

> **Propósito:** ser el índice operativo para localizar capacidades antes de iniciar cualquier trabajo.  
> **Última auditoría de inventario:** 2026-10-18.  
> **Repositorio:** `bladimirhurtado/bladi3ai`.  
> **Estado de este documento:** registro maestro fusionado en `main`; auditoría de seguimiento actualizada tras fusionar PR #16, #17 y #18 el 2026-10-18.

## 1. Reglas de uso

1. Antes de empezar un proyecto, consultar este registro y las instrucciones locales del repositorio.
2. Elegir herramientas según la tarea; no activar todas por rutina.
3. Distinguir siempre:
   - **Disponible en el catálogo:** la herramienta/skill aparece en el entorno.
   - **Conectada y autorizada:** la cuenta o el servicio permite la operación requerida.
   - **Implementada:** el código o las instrucciones existen.
   - **Probada:** se ejecutó una prueba reproducible y hay evidencia.
   - **Operativa en producción:** se verificó el flujo completo en el entorno de destino.
4. No deducir que una integración está conectada solo porque aparece en el catálogo.
5. No afirmar que una prueba se ejecutó si solo se revisó código o documentación.
6. Preservar originales. Trabajar en ramas o copias nuevas; no fusionar ni desplegar sin autorización.
7. Antes de instalar dependencias, ejecutar código desconocido, modificar producción, publicar, borrar datos o incurrir en costes, revisar riesgos y permisos.
8. No copiar claves, tokens ni datos sensibles a este registro.

## 2. Inventario de ChatGPT disponible en la auditoría

Instantánea tomada el 2026-10-18 desde los catálogos visibles en esta sesión:

- **1.918 operaciones de herramientas** inventariadas en 63 grupos/namespaces.
- **253 definiciones de skills** expuestas por el catálogo de skills en esa consulta.
- Estas cifras son una instantánea del entorno, no una promesa de disponibilidad permanente ni un recuento de cuentas conectadas.
- La biblioteca de skills de ChatGPT y las skills propias versionadas en este repositorio son inventarios distintos.

### Familias principales de herramientas

| Familia | Herramientas/grupos de referencia | Uso típico | Verificación necesaria |
|---|---|---|---|
| Código y repositorios | GitHub | ramas, archivos, commits, PR, CI | permisos, estado real de rama/PR y checks |
| Desarrollo y despliegue | Vercel, Netlify, AppDeploy, Replit, Lovable, Base44, Buildy, Wix | crear, editar, publicar aplicaciones | proyecto vinculado, entorno, logs y URL final |
| Backend y datos | Supabase, Convex, Airtable, PostHog | base de datos, autenticación, métricas | proyecto/espacio conectado, esquema, permisos y pruebas |
| Investigación web/técnica | Exa, Firecrawl, Tavily, Parallel Search, TinyFish, HAPI MCP Registry | buscar fuentes, explorar páginas y herramientas | fuente primaria, fecha, acceso y corroboración |
| Investigación científica | Consensus, SciSpace, Undermind | literatura científica y síntesis | DOI, texto completo, calidad y actualidad de fuentes |
| Documentos y colaboración | Dropbox, Notion, Slack, Outlook, monday.com, Granola, Structured | archivos, notas, correo, reuniones y tareas | conexión, permisos y alcance de lectura/escritura |
| Diseño y medios | Canva, MagicPath, tldraw, Cloudinary, HeyGen | prototipos, piezas visuales, vídeo y medios | especificaciones, derechos, salida y revisión humana |
| Infraestructura/automatización | SentinelX, microfn, Automations, Vercel | operaciones técnicas y flujos recurrentes | entorno objetivo, autorización, registros y reversión |
| Seguridad/privacidad | Malwarebytes, AJAXX Data Scrubber y capacidades de auditoría de código | reputación, exposición y diagnóstico | alcance autorizado; no confundir análisis parcial con certificación |
| Especializadas | Binance, Blockscout, Shopify, Booking.com, Trip.com, LinkedIn, Indeed, Resend y otras | finanzas, comercio, viajes, empleo, mensajería | cuenta conectada, permisos, datos actuales y límites del servicio |

**Nota:** esta tabla es una guía por familias, no un listado exhaustivo de cada operación. Para la operación concreta, inspeccionar la descripción de la herramienta y su esquema antes de llamarla.

## 3. Skills propias versionadas en Bladi 3AI

El validador `scripts/validate-skills.py` define **23 paquetes propios**. La comprobación estructural confirma metadatos y contenido mínimo; no certifica eficacia funcional de cada skill.

| Skill | Función principal | Complementos habituales |
|---|---|---|
| `investigacion-herramientas` | buscar y comparar herramientas con fuentes | arquitectura, seguridad, QA |
| `agente-desarrollo-skills` | inspeccionar, clonar de forma segura, revisar y planificar | ingeniería, clonación, resiliencia, QA |
| `orquestador-multi-ia` | coordinar roles/modelos con límites y síntesis verificable | integración, seguridad, QA |
| `ingenieria-software` | diseño e implementación de software | arquitectura, dependencias, QA |
| `auditoria-ia-aegis-hydra` | evaluar riesgos y controles de sistemas de IA | seguridad, QA, documentación |
| `integracion-sistemas` | conectar APIs, servicios y componentes | seguridad, resiliencia, QA |
| `control-calidad-qa` | criterios de aceptación y pruebas reproducibles | todas las skills de implementación |
| `arquitectura-sistemas` | componentes, límites y contratos técnicos | investigación, ingeniería, datos |
| `seguridad-optimizacion` | seguridad y rendimiento | arquitectura, dependencias, QA |
| `gestion-documentacion` | documentación mantenible y evidencias | todas las áreas |
| `diseno-ui-ux` | interfaz y experiencia de usuario | prototipado, ingeniería, QA |
| `gestion-errores-resiliencia` | diagnóstico, recuperación y tolerancia a fallos | integración, ingeniería, QA |
| `automatizacion-flujos` | automatizar tareas repetibles | integración, seguridad, QA |
| `analisis-datos-metricas` | análisis y métricas | datos, visualización, QA |
| `despliegue-configuracion` | entornos y lanzamientos | seguridad, resiliencia, QA |
| `seguridad-auditoria-ataque` | pruebas de seguridad autorizadas | seguridad, arquitectura, QA |
| `ingenieria-inversa-educativa` | estudiar código/comportamiento dentro del alcance autorizado | seguridad, documentación, QA |
| `refactorizacion-codigo` | reorganizar manteniendo comportamiento | ingeniería, QA, resiliencia |
| `gestion-dependencias-parches` | revisar dependencias y parches | seguridad, ingeniería, QA |
| `diseno-bases-datos` | esquemas, consultas y migraciones | arquitectura, integración, QA |
| `clonacion-replicacion-entornos` | crear copias de trabajo sin dañar el origen | agente de desarrollo, seguridad, QA |
| `anatomia-agentes-ia` | analizar componentes y flujos de agentes | orquestador, arquitectura, seguridad |
| `analizador-pro-movil` | inspección técnica de aplicaciones móviles | ingeniería inversa, seguridad, documentación |

### Skills externas del catálogo

El catálogo de ChatGPT expone skills adicionales de productos y proveedores (por ejemplo, diseño de producto, Vercel, Supabase, Notion, analítica y flujos de desarrollo). No se consideran parte de las 23 skills propias ni se asume que todas estén instaladas, conectadas o disponibles en cualquier entorno.

**Regla de selección:** priorizar una skill propia cuando cubra el proceso; usar una skill externa especializada cuando aporte instrucciones o herramientas específicas que realmente estén disponibles.

## 4. Agentes, aplicaciones y proyectos

| Activo | Ubicación / fuente de verdad | Estado que se debe verificar antes de usar |
|---|---|---|
| Bladi 3AI | raíz del repositorio y `.agents/skills/` | rama actual, instrucciones, CI y PRs |
| Agente de desarrollo | `scripts/dev_agent.py`, `tests/test_dev_agent.py`, `docs/development-agent/README.md` | disponibilidad local de Python/archivos y resultado de pruebas |
| Validador de skills | `scripts/validate-skills.py` | ejecutar validador en el commit actual |
| Equipo multi-IA de Nexus | `.agents/skills/orquestador-multi-ia/SKILL.md` y `docs/multi-ai-team/README.md` | secretos de proveedor, modelos permitidos, despliegue, coste y llamada real por rol |
| Inspector de APK / laboratorio inverso | revisar PR y rama activa antes de usar | estado de PR, alcance autorizado, artefactos y pruebas; no ejecutar APK desconocidos |
| Nexus AI Hub / Router Lab | repositorio y ramas específicas del proyecto Nexus | confirmar rama, commit, proveedor, presupuesto, límites y prueba real |
| Planeta Z (contenido de servidor ARK) | contexto y documentos del proyecto | validar reglas/precios vigentes antes de publicar |
| Herramientas de usuario/conectores | sección de conexiones del entorno | conexión, permisos y consentimiento por acción |

Los estados de proyectos y solicitudes de cambios cambian con el tiempo. Este registro no sustituye la consulta de GitHub en vivo ni declara que las ramas estén fusionadas.

## 5. Procedimiento recomendado para cualquier tarea

### Antes
1. Definir el resultado verificable.
2. Identificar el repositorio, la rama y el entorno correctos.
3. Leer las instrucciones locales (`AGENTS.md`, README y skill aplicable).
4. Seleccionar solo las skills y herramientas necesarias.
5. Identificar permisos, secretos, coste y riesgos.
6. Guardar el estado inicial y acordar qué no se debe modificar.

### Durante
1. Trabajar en una rama/copia aislada cuando haya cambios de código.
2. Ejecutar tareas independientes en paralelo solo si no comparten estado.
3. Registrar los comandos/acciones realmente ejecutados.
4. Separar hechos, hipótesis y recomendaciones.
5. Si una herramienta falla o no está conectada, informar el bloqueo y no simular el resultado.

### Después
1. Ejecutar pruebas adecuadas al cambio.
2. Revisar diff, seguridad básica, compatibilidad y regresiones.
3. Verificar CI y estado del PR cuando corresponda.
4. Entregar rutas/archivos, commit/PR, evidencia y limitaciones.
5. No fusionar, desplegar ni publicar sin autorización explícita.

## 6. Matriz de madurez

Aplicar a cada herramienta, skill, agente o integración:

- **M0 — Catalogado:** solo sabemos que existe.
- **M1 — Inspeccionado:** documentación, ubicación, requisitos y permisos revisados.
- **M2 — Prueba aislada:** pasó una prueba reproducible de su función principal.
- **M3 — Integrado:** pasó una prueba de integración con componentes vecinos.
- **M4 — Operativo en destino:** se comprobó el flujo de extremo a extremo en el entorno previsto, con supervisión y límites apropiados.

No asignar un nivel superior sin evidencia enlazada (commit, ejecución, log saneado, resultado o informe). Añadir fecha de última verificación y persona/entorno responsable.

## 7. Estado de auditoría y backlog

### Completado en esta revisión (2026-10-18)

- PR #16 fusionada en `main` como commit `8e78062b8af20d730ded0a5e757521c23ce9d15c`.
- GitHub Actions runs `39150470118`, `39151240372` y `39151274416` pasaron; los tres incluyeron `Validate reusable skills` y `Test development agent`.
- PR #18 añadió una prueba positiva de clonación local y se fusionó tras CI exitoso. La prueba crea un repositorio Git temporal, lo clona a un destino nuevo y verifica contenido/metadatos sin ejecutar código del proyecto.
- PR #17 actualizó la evidencia y añadió el documento de continuidad; también se fusionó tras CI exitoso.
- Se revisó el estado actual de las PR abiertas y las cadenas de ramas; el detalle se conserva en `ESTADO-AUDITORIA-2026-10-18.md`.
- El intento de ejecutar Git localmente en este runtime no pudo empezar porque falló la resolución DNS de `github.com`; las pruebas se verificaron mediante GitHub Actions, no mediante una ejecución local.

### Pendiente / bloqueado

1. **P1:** ampliar pruebas funcionales de skills propias, empezando por QA, agente de desarrollo, integración y seguridad.
2. **Completado:** añadir una prueba positiva de clonación sobre un repositorio Git temporal local; PR #18 y CI run `39151274416` pasaron.
3. **P1 bloqueado:** probar Nexus multi-IA con una llamada no sensible por rol. La PR #15 informa que falta `OPENROUTER_API_KEY` en el entorno de destino; no afirmar llamadas reales ni síntesis verificada.
4. **P2:** probar cadenas de colaboración (investigación → arquitectura → implementación → QA).
5. **P2:** registrar conexiones y permisos de herramientas externas realmente utilizadas, sin guardar credenciales.
6. **P3:** automatizar un informe periódico de cambios de catálogo, pruebas y deuda técnica.

Los estados, evidencias y limitaciones detallados se mantienen en el JSON para facilitar automatización.

## 8. Mantenimiento del registro

- Actualizar este archivo cuando se agregue, retire o cambie de función una skill, agente o integración.
- Actualizar la instantánea del catálogo solo después de volver a consultar el entorno; no asumir que los conteos siguen iguales.
- Mantener secretos fuera de Git.
- Conservar historial mediante commits/PR revisables.
- Revisar este registro al iniciar una conversación de trabajo importante y al cerrar un proyecto.
