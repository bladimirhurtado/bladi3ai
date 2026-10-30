# REA en Android con Termux

## Abrir el menú

Desde la carpeta del repositorio `~/bladi3ai`, ejecuta:

```bash
bash rea.sh
```

El menú permite:
1. Inventariar un proyecto sin ejecutar su código.
2. Buscar señales de problemas y posibles secretos mediante heurísticas.
3. Generar un plan de mejoras sin cambiar archivos.
4. Examinar un archivo local mediante metadatos y hash; no lo ejecuta ni extrae.
5. Comprobar Python, las herramientas y ejecutar las pruebas disponibles.
6. Iniciar el puente local de solo lectura para conectar el Taller de herramientas.\n7. Analizar el inventario PAK de ARK (CSV + TXT), en modo de solo lectura.

## Conexión del Taller con REA

1. Actualiza la copia local del repositorio desde GitHub para recibir `scripts/rea_bridge.py` y la opción 6 del menú.
2. Ejecuta `bash rea.sh` y elige `6`.
3. Termux mostrará un token temporal. No lo publiques ni lo compartas; pégalo únicamente en la sección **Conexión REA** del Taller.
4. Deja abierta la sesión de Termux mientras utilizas la conexión. En el Taller, pulsa **Probar conexión**.
5. Para cerrar el puente, vuelve a Termux y pulsa `Ctrl+C`.

El puente escucha únicamente en `127.0.0.1:8765`, genera un token nuevo cada vez que arranca y acepta peticiones de estado solo desde el dominio público del Taller. No recibe rutas ni comandos y no modifica archivos. La primera prueba desde el navegador Android sigue siendo necesaria: algunos navegadores pueden bloquear peticiones entre una página HTTPS y el servicio local. Si eso ocurre, el Taller mostrará el error sin declarar la conexión como activa.

## Requisitos y límites

- Termux, Python 3 y el repositorio `bladi3ai` clonado localmente.
- No instala paquetes ni necesita claves API.
- REA no controla automáticamente otras aplicaciones ni puede saltarse permisos de Android.
- El puente actual es de lectura: comprueba que REA existe y devuelve versión de Python, archivos esperados y estado Git. No ejecuta pruebas ni comandos solicitados por la web.
- La opción 5 ejecuta las pruebas del repositorio; las demás opciones de inspección no ejecutan el código del proyecto analizado.


## Analizador del inventario ARK

La opción 7 ejecuta `scripts/ark_inventory_analyzer.py`. Indica la ruta completa de `ARK-inventario.csv` y, si está disponible, la de `ARK-componentes.txt`. El módulo valida las filas, agrupa extensiones, busca rutas candidatas por áreas del juego y genera informes TXT y JSON en el directorio de trabajo.

Ejemplo desde Termux:

```bash
python scripts/ark_inventory_analyzer.py "/ruta/ARK-inventario.csv" --components "/ruta/ARK-componentes.txt"
```

Es un análisis de metadatos: no decodifica todavía los paquetes UAsset/UEXP, no extrae ni modifica el PAK y las coincidencias de nombres son pistas que requieren validación.
