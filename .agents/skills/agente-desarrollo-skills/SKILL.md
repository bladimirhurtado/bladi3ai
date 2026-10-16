---
name: agente-desarrollo-skills
description: Coordina clonación segura de repositorios, diagnóstico de errores y refactorización verificable, usando herramientas reutilizables y preservando el trabajo original.
---

# Agente de Desarrollo de Skills

## Propósito
Convertir tareas de desarrollo en cambios pequeños, revisables y verificables. Integra tres modos independientes: clonar, reconstruir y revisar-errores. Se puede invocar un modo aislado o encadenarlos cuando el objetivo lo requiera.

Esta skill es el coordinador operativo. El CLI complementario en scripts/dev_agent.py ayuda con inventario, revisión heurística, planificación y clonación; no sustituye el juicio técnico ni ejecuta refactorizaciones automáticas.

## Inicio rápido: probar la skill ahora

Cuando el usuario pida trabajar con un proyecto, identifica primero el objetivo y selecciona el modo apropiado. No ejecutes los tres modos por rutina.

- **Clonar:** cuando se necesite una copia independiente. Confirma origen y destino; nunca sobrescribas el destino.
- **Reconstruir:** cuando se necesite reorganizar, modernizar o refactorizar un proyecto existente.
- **Revisar errores:** cuando haya un fallo concreto, una regresión o sospecha de defectos.
- **Inspección inicial:** si el alcance aún no está claro, empieza por inventariar y leer; no modifiques nada.

### Secuencia mínima de una prueba

1. Declara el modo elegido y el alcance en una frase.
2. Comprueba qué herramientas están realmente disponibles en el entorno actual. No supongas que el CLI está instalado ni que puedes acceder al sistema de archivos del usuario.
3. Registra el estado inicial y conserva el original.
4. Ejecuta solo las comprobaciones seguras necesarias para el objetivo. Antes de instalar dependencias, ejecutar código desconocido, publicar, desplegar, borrar datos o incurrir en costes, solicita autorización cuando corresponda.
5. Entrega evidencias concretas: archivos leídos o modificados, comandos realmente ejecutados, resultados y limitaciones.
6. Si falta una capacidad (por ejemplo, ejecución local), no simules el resultado: continúa con la verificación disponible y explica qué falta.

### Comandos de comprobación del paquete

Desde la raíz del repositorio Bladi 3AI, si Python y los archivos están disponibles localmente:

    python3 scripts/dev_agent.py --help
    python3 scripts/dev_agent.py inspect . --json
    python3 scripts/dev_agent.py review . --json
    python3 scripts/dev_agent.py plan . --json
    python3 -m unittest discover -s tests -v
    python3 scripts/validate-skills.py

Para una prueba de clonación, usa únicamente un repositorio autorizado y un destino temporal nuevo. No hace falta clonar nada para probar los modos inspect, review o plan.

## Reglas fundamentales
- Inspecciona AGENTS.md, el catálogo de skills, el estado del repositorio, la rama y las pruebas antes de modificar archivos.
- Preserva el origen. Trabaja en una rama o copia nueva; no sobrescribas ni elimines datos existentes sin autorización explícita.
- Distingue hechos observados, hipótesis, decisiones, cambios y resultados de pruebas.
- No afirmes que una operación, prueba, instalación o despliegue tuvo éxito sin evidencia observable.
- No ejecutes código de un repositorio desconocido solo por clonarlo o inspeccionarlo.
- No expongas credenciales, tokens, datos personales ni contenido sensible en logs, informes, pruebas o commits.
- Selecciona solo las skills complementarias necesarias: ingeniería-software, control-calidad-qa, arquitectura-sistemas, refactorizacion-codigo, clonacion-replicacion-entornos, gestion-errores-resiliencia, gestion-documentacion y seguridad-optimizacion.
- Las instrucciones de esta skill no conceden permisos para modificar cuentas, servicios externos, producción o dispositivos.

## Modo 1: clonar

### Objetivo
Crear una copia independiente sin alterar el origen ni ejecutar automáticamente código del proyecto.

### Procedimiento
1. Confirma origen, destino, propósito, autorización y si se necesita historial completo.
2. Comprueba que el destino no existe o está vacío y que su directorio padre es el esperado. No sobrescribas una carpeta existente.
3. Verifica que Git está disponible y que el origen tiene un formato permitido. No incrustes credenciales en URLs; usa autenticación segura del entorno.
4. Clona sin inicializar submódulos ni ejecutar scripts de instalación automáticamente.
5. Registra URL saneada, rama/commit cuando se pueda consultar, estado y resultado de la operación.
6. Inspecciona los archivos y manifiestos antes de instalar dependencias o ejecutar pruebas.
7. Compara el resultado con el objetivo y documenta cualquier limitación.

### CLI
Desde la raíz de Bladi 3AI:

    python3 scripts/dev_agent.py clone https://github.com/OWNER/REPO.git ./workspace/REPO
    python3 scripts/dev_agent.py inspect ./workspace/REPO --json

El destino debe ser nuevo. La clonación no instala dependencias, no inicia submódulos y no ejecuta scripts del proyecto.

## Modo 2: reconstruir

### Objetivo
Reestructurar, modernizar o refactorizar código preservando el comportamiento observable, salvo que el usuario solicite explícitamente un cambio funcional.

### Procedimiento
1. Establece una línea base: commit, estado Git, archivos principales, dependencias, APIs/contratos y pruebas existentes.
2. Define el problema que justifica la reconstrucción. No migres de lenguaje o framework por moda.
3. Mapea módulos, dependencias, límites de confianza y puntos de entrada.
4. Identifica la causa de cada problema con ejemplos o evidencia. Separa defectos confirmados de hipótesis.
5. Propón un plan incremental con criterios de aceptación, riesgos, compatibilidad y mecanismo de reversión.
6. Implementa un cambio pequeño cada vez. Conserva interfaces públicas salvo decisión explícita.
7. Ejecuta las pruebas relevantes y agrega pruebas de caracterización cuando no exista una línea base.
8. Revisa el diff y los archivos afectados; comprueba que no se hayan añadido secretos, archivos generados ni cambios ajenos al alcance.
9. Documenta qué cambió, qué comportamiento se conserva, qué pruebas se ejecutaron y qué queda pendiente.

### CLI
    python3 scripts/dev_agent.py plan ./ruta/proyecto --json

El comando plan solo inspecciona y propone pasos; no modifica archivos. La reconstrucción efectiva la realiza el agente de desarrollo con herramientas de edición autorizadas, en cambios revisables y bajo control de versiones.

## Modo 3: revisar-errores

### Objetivo
Encontrar y corregir causas raíz sin ocultar errores ni introducir regresiones.

### Procedimiento
1. Recopila el mensaje de error completo, stack trace, comando de reproducción, versión de runtime y cambio reciente relevante. Elimina secretos de los registros.
2. Reproduce el fallo en un entorno controlado si es seguro y está autorizado.
3. Clasifica el fallo: sintaxis, tipos, lógica, archivos, permisos, dependencias, red, concurrencia, recursos o seguridad.
4. Formula hipótesis y busca evidencia que pueda refutarlas.
5. Aplica la corrección mínima que resuelve la causa raíz; no añadas reintentos a errores deterministas.
6. Usa timeouts y reintentos limitados con backoff/jitter solo para operaciones transitorias e idempotentes. No repitas automáticamente acciones destructivas o con coste.
7. Añade una prueba que falle antes de la corrección y pase después, cuando sea viable.
8. Ejecuta las pruebas afectadas y una regresión razonable. Informa también de pruebas que no pudieron ejecutarse.
9. Entrega el error original, causa raíz, solución, archivos cambiados, resultados y riesgos restantes.

### CLI
    python3 scripts/dev_agent.py review ./ruta/proyecto
    python3 scripts/dev_agent.py review ./ruta/proyecto --json

La revisión es heurística y estática. Busca marcadores de conflicto y patrones comunes de posibles secretos, pero puede producir falsos positivos o no detectar ciertos problemas. No ejecuta pruebas, linters ni scripts del proyecto. No presentes el resultado como certificación de seguridad.

## Herramienta CLI

El script scripts/dev_agent.py utiliza únicamente la biblioteca estándar de Python. Comandos disponibles:

- inspect: inventario de archivos, manifiestos, ubicaciones probables de pruebas y metadatos Git.
- clone: clonación explícita a un destino que no exista.
- review: revisión heurística de texto y hallazgos sin revelar los valores que parezcan secretos.
- plan: plan orientativo de refactorización sin escrituras.

Cada comando admite --json. Las operaciones inspect, review y plan no ejecutan código del repositorio. El comando clone llama a Git de forma explícita, pero no instala dependencias ni inicializa submódulos.

## Límites técnicos y de seguridad
- La revisión heurística no es un analizador completo, ni un veredicto de malware, ni una auditoría de seguridad.
- Una validación de rutas en código de ejemplo no equivale a una sandbox; considera enlaces simbólicos, permisos y condiciones de carrera.
- La instalación de dependencias y la ejecución de pruebas pueden ejecutar código de terceros. Hazlo solo después de revisar el proyecto y obtener autorización adecuada.
- No uses esta skill para obtener acceso no autorizado, evadir licencias, extraer secretos, ocultar persistencia o modificar sistemas ajenos.
- Si una operación no se puede ejecutar en el entorno disponible, entrega instrucciones reproducibles y declara la limitación; no inventes resultados.

## Formato de entrega
- Objetivo y alcance.
- Estado inicial y herramientas disponibles.
- Hallazgos confirmados e hipótesis.
- Cambios y archivos afectados.
- Comandos de prueba realmente ejecutados y resultados.
- Riesgos, limitaciones y reversión.
- Enlace a rama/PR cuando el trabajo se realice en GitHub.

## Criterio de finalización
La tarea se considera completa solo cuando el cambio está delimitado, la documentación coincide con el comportamiento real, las pruebas disponibles se han ejecutado y sus resultados están registrados. Si falta alguna verificación, se informa como pendiente en lugar de declarar éxito total.
