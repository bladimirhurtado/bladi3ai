# Agente de Desarrollo de Skills

Herramienta reutilizable del repositorio Bladi 3AI para coordinar clonación de repositorios, revisión heurística y planificación de refactorización.

## Requisitos

- Python 3.10 o posterior recomendado.
- Git instalado solo para usar el comando clone o consultar metadatos Git.
- No requiere paquetes Python de terceros.

## Comandos

Ejecuta desde la raíz del repositorio:

    python3 scripts/dev_agent.py inspect .
    python3 scripts/dev_agent.py inspect . --json
    python3 scripts/dev_agent.py review .
    python3 scripts/dev_agent.py review . --json
    python3 scripts/dev_agent.py plan .
    python3 scripts/dev_agent.py plan . --json
    python3 scripts/dev_agent.py clone https://github.com/OWNER/REPO.git ./workspace/REPO

### inspect
Genera un inventario de archivos, manifiestos reconocidos, posibles ubicaciones de pruebas y estado Git. No ejecuta código del proyecto.

### review
Busca marcadores de conflicto Git y patrones comunes que podrían indicar secretos. Solo informa la ruta, línea y categoría; no reproduce los valores detectados. Es heurístico y no sustituye un escáner de secretos ni una revisión de seguridad.

### plan
Propone un proceso de refactorización a partir del inventario y señala archivos de texto grandes. No edita archivos ni garantiza que el plan sea adecuado sin revisión de ingeniería.

### clone
Clona a un directorio nuevo usando Git. Rechaza destinos existentes, URLs con credenciales incrustadas y esquemas remotos no admitidos. No instala dependencias, no inicializa submódulos ni ejecuta scripts de instalación. Inspecciona el repositorio antes de ejecutar su código.

## Pruebas

    python3 -m unittest discover -s tests -v
    python3 scripts/validate-skills.py

Las pruebas usan carpetas temporales y datos sintéticos. No descargan ni ejecutan proyectos de terceros.

## Seguridad y límites

- La herramienta no es un agente de IA independiente ni refactoriza automáticamente. La skill proporciona el procedimiento para que un agente con herramientas de edición autorizadas realice el trabajo.
- La revisión estática puede producir falsos positivos y falsos negativos.
- El control de rutas del ejemplo no debe considerarse una sandbox completa contra enlaces simbólicos o condiciones de carrera.
- La instalación de dependencias y la ejecución de pruebas de un proyecto pueden ejecutar código de terceros. Evalúa el riesgo y pide autorización antes de hacerlo.
- No se incluyen credenciales ni se envían archivos a servicios externos.

## Flujo recomendado

1. Inspeccionar el proyecto y registrar su estado inicial.
2. Revisar los riesgos y las dependencias declaradas.
3. Crear una rama o una copia nueva antes de cambiar código.
4. Definir criterios de aceptación y una prueba reproducible.
5. Realizar cambios pequeños, revisar el diff y ejecutar las pruebas autorizadas.
6. Documentar resultados reales, limitaciones y cómo revertir.

La implementación está diseñada para ayudar a realizar tareas de desarrollo de forma controlada, no para certificar automáticamente la calidad o seguridad de un repositorio.
