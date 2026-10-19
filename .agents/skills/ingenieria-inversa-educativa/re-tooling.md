# Selección de herramientas de ingeniería inversa

Elige herramientas según el artefacto y la pregunta. Verifica requisitos y documentación oficial antes de instalar. Esta guía no afirma que las herramientas estén instaladas ni que se hayan probado en este repositorio.

## Primera pasada: inspección estática
- **Triage local**: `python scripts/re_triage.py <archivo>` calcula SHA-256, tamaño, indicios de formato y metadatos ZIP/APK limitados. No ejecuta ni extrae muestras.
- **Inventario y documentación**: registra versión, procedencia, permisos, firmas, dependencias y hashes cuando estén disponibles.

## Herramientas especializadas

### Ghidra
- **Útil para**: ejecutables compilados, desensamblado, descompilación asistida, referencias cruzadas, grafos de flujo y scripts de análisis.
- **Preparación**: revisar la documentación oficial de la versión elegida y sus requisitos de Java; ejecutar el análisis en una máquina o entorno de laboratorio controlado.
- **Límites**: la descompilación es una reconstrucción aproximada; nombres, tipos, comentarios y código fuente original pueden faltar o diferir.

### JADX
- **Útil para**: analizar APK/DEX de Android, estructura de clases, recursos y manifiesto.
- **Preparación**: obtener una distribución oficial y comprobar sus requisitos; no instalar APK desconocidos en el teléfono de uso diario.
- **Límites**: ofuscación, código dinámico, bibliotecas nativas y optimizaciones pueden impedir reconstrucciones fieles.

### Frida
- **Útil para**: instrumentación dinámica autorizada de procesos para observar llamadas, argumentos y comportamiento en tiempo de ejecución.
- **Preparación**: laboratorio aislado, dispositivo/emulador de prueba, permiso explícito y alcance limitado. Evita adjuntarte a aplicaciones o dispositivos de terceros sin autorización.
- **Límites**: instrumentación puede alterar el comportamiento y no revela automáticamente todos los caminos posibles.

### Wireshark
- **Útil para**: examinar capturas de tráfico de red obtenidas legalmente, protocolos y metadatos de comunicaciones.
- **Preparación**: capturar solo redes/sistemas autorizados; minimizar y proteger datos sensibles en los archivos PCAP.
- **Límites**: el cifrado puede ocultar contenidos; una captura parcial no describe toda la actividad de la aplicación.

## Flujo recomendado
1. Confirma autorización, pregunta, alcance y límites.
2. Preserva una copia de trabajo; registra SHA-256 y procedencia.
3. Ejecuta triage estático y registra evidencia.
4. Selecciona herramienta según formato y pregunta.
5. Solo si es necesario, realiza análisis dinámico en laboratorio aislado.
6. Correlaciona evidencia, hipótesis alternativas y nivel de confianza.
7. Usa `../REPORT-TEMPLATE.md` (en `docs/reverse-engineering/REPORT-TEMPLATE.md`) para documentar resultados y limitaciones.

## Enlaces oficiales
- Ghidra: https://github.com/NationalSecurityAgency/ghidra
- JADX: https://github.com/skylot/jadx
- Frida: https://frida.re/docs/home/
- Wireshark: https://www.wireshark.org/docs/
