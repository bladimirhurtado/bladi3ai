# Analizador Pro Móvil

Herramienta educativa, local y responsive para una revisión inicial de código y archivos APK. No necesita librerías externas ni envía archivos a una API.

## Uso
1. Abre `app/index.html` en un navegador moderno.
2. Pega código o selecciona uno o varios archivos de texto fuente.
3. Revisa las métricas y los patrones detectados; exporta el informe JSON si lo necesitas. Los archivos de texto tienen un límite de 2 MiB cada uno y 10 MiB en conjunto.
4. Para APK, la app calcula el tamaño y SHA-256 y busca cadenas de permisos visibles dentro del contenedor. **No decodifica el AndroidManifest.xml binario ni descompila DEX**, por lo que esa inspección es preliminar y puede omitir permisos o mostrar falsos positivos.

## Alcance
- Métricas heurísticas: líneas, funciones/clases aproximadas y marcadores de complejidad.
- Comprobaciones de patrones básicos para Python; no equivalen a un análisis OWASP/SAST completo.
- Plantillas de código y borradores de tests que deben revisarse antes de usarse.
- Inspección estática inicial de APK sin instalarlo ni ejecutarlo.
- Historial limitado al almacenamiento local del navegador; conserva métricas resumidas, no el código fuente.
- Los APK están limitados a 75 MiB para reducir el riesgo de agotar la memoria de un móvil.

## Limitaciones y seguridad
- No es un compilador, parser AST, descompilador, antivirus ni certificación de seguridad.
- Un resultado vacío no significa que el código o APK sea seguro.
- Los archivos se procesan localmente; no se transmiten por red desde la aplicación.
- Usa solo APKs propios o autorizados y no ejecutes muestras desconocidas en tu teléfono principal.
