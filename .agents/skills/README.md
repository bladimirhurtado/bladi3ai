# Catálogo de skills reutilizables

Este directorio reúne skills orientadas a tareas técnicas y de producto. Cada paquete usa `SKILL.md` con metadatos YAML (`name`, `description`) e instrucciones operativas.

## Inventario y enrutamiento

| Skill | Úsala cuando... |
|---|---|
| `investigacion-herramientas` | Hay que descubrir, comparar o validar una herramienta o recurso. |
| `ingenieria-software` | Hay que implementar, depurar o probar código. |
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
| `ingenieria-inversa-educativa` | Hay que estudiar sistemas/código con finalidad educativa dentro de Bladi 3AI. Incluye triage local y guías para análisis especializado. |
| `hackeo-etico-laboratorio` | Hay que aplicar metodología de red team en CTF, laboratorios propios o artefactos autorizados, con evidencia y contención. |
| `reverse-engineering` | Hay que analizar software, APKs, binarios, archivos o comportamiento observable con evidencia reproducible y autorización. Skill independiente y reutilizable. |
| `refactorizacion-codigo` | Hay que mejorar estructura sin cambiar comportamiento accidentalmente. |
| `gestion-dependencias-parches` | Hay que actualizar o auditar dependencias y parches. |
| `diseno-bases-datos` | Hay que diseñar esquemas, consultas o migraciones. |
| `clonacion-replicacion-entornos` | Hay que replicar repositorios, plantillas o entornos sin dañar el origen. |
| `anatomia-agentes-ia` | Hay que analizar arneses, bucles, herramientas y memoria de agentes. |
| `anatomy` (upstream) | Hay que usar el paquete original de Anatomy para trabajos de visualización/explicación técnica según sus propias instrucciones. |

## Workbench de ingeniería inversa

- Especificación: `docs/reverse-engineering/SPEC.md`
- Plan: `docs/reverse-engineering/IMPLEMENTATION-PLAN.md`
- Uso del analizador: `docs/reverse-engineering/USAGE.md`
- Plantilla de informe: `docs/reverse-engineering/REPORT-TEMPLATE.md`
- CLI estática: `python scripts/re_triage.py <archivo> [--json]`
- Inspector APK: `python scripts/apk_static_inspect.py <archivo.apk> --out <informe.json>`
- Auditoría de metadatos del teléfono (requiere ADB y autorización): `python scripts/android_device_audit.py --package <id> --out <informe.json>`
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

Estado: las 20 skills solicitadas tienen guías operativas iniciales. Deben considerarse **versión inicial** hasta que se validen en tareas reales; no son certificaciones ni evidencia de que proyectos concretos funcionen. El paquete upstream Anatomy se conserva intacto y se incluye como base original complementaria para la skill de anatomía de agentes.
