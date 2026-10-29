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

## Requisitos

- Termux
- Python 3
- Repositorio `bladi3ai` clonado localmente

No instala dependencias ni necesita claves API. En las opciones 1–3, pega la ruta completa del proyecto o pulsa Enter para usar la carpeta del repositorio. En la opción 4, pega la ruta completa del archivo.

## Límites importantes

REA es una caja de herramientas local: no controla automáticamente otras aplicaciones ni puede saltarse permisos de Android. Los resultados de revisión son indicios, no un veredicto de seguridad. La opción 5 ejecuta las pruebas del repositorio; las demás opciones de inspección no ejecutan el código del proyecto analizado.
