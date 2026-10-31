# Catálogo de skills reutilizables

Este directorio reúne skills orientadas a tareas técnicas y de producto. Cada paquete usa `SKILL.md` con metadatos YAML (`name`, `description`) e instrucciones operativas.

## Inventario y enrutamiento

| Skill | Úsala cuando... |
|---|---|
| `investigacion-herramientas` | Hay que descubrir, comparar o validar una herramienta o recurso. |
| `agente-desarrollo-skills` | Hay que clonar repositorios, revisar errores o coordinar una refactorización verificable. Incluye CLI estándar en `scripts/dev_agent.py`. |
| `orquestador-multi-ia` | Hay que coordinar modelos de varios proveedores, asignar roles independientes y sintetizar resultados con verificación y límites de coste. |
| `ingenieria-software` | Hay que implementar, depurar o probar código. |
| `codex-ingenieria-codigo-conectividad` | Hay que crear/descodificar código y datos, analizar protocolos o preparar pruebas Bluetooth Classic/BLE autorizadas. |
| `auditoria-ia-aegis-hydra` | Hay que evaluar seguridad, privacidad y supervisión de un sistema de IA. |
| `integracion-sistemas` | Hay que conectar APIs, servicios, webhooks o autenticación. |
| `control-calidad-qa` | Hay que demostrar que un entregable cumple sus requisitos. |
| `arquitectura-sistemas` | Hay que definir componentes, límites, contratos o decisiones técnicas. |
| `seguridad-optimizacion` | Hay que endurecer o mejorar rendimiento con mediciones. |
| `gestion-documentacion` | Hay que redactar o mantener documentación técnica. |
| `diseno-ui-ux` | Hay que diseñar o revisar una interfaz y su experiencia. |
| `gestion-errores-resiliencia` | Hay que diagnosticar fallos y diseñar recuperación segura. |
| `automatizacion-flujos` | Hay que automatizar tareas repetitivas o procesos. |
| `analisis-datos-metricas` | Hay que validar, analizar o comunicar datos y métricas. |
| `despliegue-configuracion` | Hay que preparar entornos, configuración o lanzamientos. |
| `seguridad-auditoria-ataque` | Hay que hacer pruebas de seguridad con autorización y alcance definido. |
| `ingenieria-inversa-educativa` | Hay que estudiar código fuente y comportamiento con finalidad educativa y autorización; incluye triage local y guías para análisis especializado. |
| `reverse-engineering` | Hay que analizar software, APKs, binarios, archivos o comportamiento observable con evidencia reproducible y autorización. Skill independiente y reutilizable. |
| `refactorizacion-codigo` | Hay que mejorar estructura sin cambiar comportamiento accidentalmente. |
| `gestion-dependencias-parches` | Hay que actualizar o auditar dependencias y parches. |
| `diseno-bases-datos` | Hay que diseñar esquemas, consultas o migraciones. |
| `clonacion-replicacion-entornos` | Hay que replicar repositorios, plantillas o entornos sin dañar el origen. |
| `anatomia-agentes-ia` | Hay que analizar arneses, bucles, herramientas y memoria de agentes. |
| `analizador-pro-movil` | Hay que revisar código fuente y realizar una inspección preliminar y local de APKs sin ejecutarlos. |
| `anatomy` (upstream) | Hay que usar el paquete original de Anatomy para trabajos de visualización/explicación técnica según sus propias instrucciones. |

## CODEX — Ingeniería de Código y Conectividad

- Skill: `.agents/skills/codex-ingenieria-codigo-conectividad/SKILL.md`
- Guías: `references/bluetooth-lab.md` y `references/encoding-decoding.md`
- Distingue Bluetooth Classic de BLE, hardware real de simulación y resultados observados de hipótesis.
- Es una skill de instrucciones reutilizable: no activa por sí sola el adaptador Bluetooth ni concede acceso a dispositivos.

## Equipo multi-IA

- Skill operativa: `.agents/skills/orquestador-multi-ia/SKILL.md`
- Arquitectura/configuración: `docs/multi-ai-team/README.md`
- El modo Equipo de Nexus utiliza modelos distintos mediante OpenRouter; los nombres configurados no garantizan que cada modelo esté disponible. La disponibilidad real debe probarse con la clave del entorno.

## Agente de Desarrollo

- Skill operativa: `.agents/skills/agente-desarrollo-skills/SKILL.md`
- Guía y comandos: `docs/development-agent/README.md`
- CLI estándar: `scripts/dev_agent.py`
- Pruebas: `python3 -m unittest discover -s tests -v`

La CLI ofrece inventario (`inspect`), clonación explícita a destino nuevo (`clone`), revisión heurística de archivos de texto (`review`) y planificación sin escritura (`plan`). No ejecuta código de los proyectos inspeccionados ni instala dependencias automáticamente.

## Workbench de ingeniería inversa

- Especificación: `docs/reverse-engineering/SPEC.md`
- Plan: `docs/reverse-engineering/IMPLEMENTATION-PLAN.md`
- Uso del analizador: `docs/reverse-engineering/USAGE.md`
- Plantilla de informe: `docs/reverse-engineering/REPORT-TEMPLATE.md`
- CLI estática: `python scripts/re_triage.py <archivo> [--json]`
- Pruebas: `python -m unittest discover -s tests -v`

El analizador es una primera pasada estática: calcula hash, detecta indicios de formato y resume metadatos limitados de ZIP/APK sin ejecutar ni extraer. No sustituye un descompilador ni determina por sí solo si un archivo es malicioso.

## Cómo usarlas
1. Lee el `SKILL.md` de la skill más pertinente antes de iniciar el trabajo.
2. Para tareas grandes, combina skills complementarias (por ejemplo, ingeniería de software + QA + seguridad).
3. No cargues todas las skills por defecto: selecciona las necesarias para el objetivo.
4. Usa documentación oficial y pruebas reales; no inventes resultados.
5. Preserva originales, secretos y datos; utiliza ramas y puntos de reversión.
6. Registra qué skill se utilizó y qué verificaciones se ejecutaron cuando aporte trazabilidad.

## Validación
Desde la raíz del repositorio ejecuta:
`python3 scripts/validate-skills.py`

El catálogo contiene skills con guías operativas iniciales. Deben considerarse **versión inicial** hasta que se validen en tareas reales; no son certificaciones ni evidencia de que proyectos concretos funcionen. El paquete upstream Anatomy se conserva intacto y se incluye como base original complementaria para la skill de anatomía de agentes.


## Investigación documentada: Anatomy

- Informe de continuidad: `.agents/skills/anatomy/INVESTIGATION-2026-10-31.md`
- Resume propósito real, módulos y scripts inspeccionados, aportes posibles a ARK y REA, límites, estado de verificación y plan de pruebas pendiente.
- Antes de usar Anatomy en un proyecto, leer el informe y el `.agents/skills/anatomy/SKILL.md`. No considerar las ejecuciones generales de GitHub Actions como pruebas de Anatomy.
