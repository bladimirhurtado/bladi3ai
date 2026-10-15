# Especificación — Bladi 3AI Reverse Engineering Workbench

**Estado:** Propuesta para revisión; todavía no implementada.  
**Rama de trabajo:** `feat/reverse-engineering-workbench`  
**Propósito:** convertir la skill `ingenieria-inversa-educativa` en un flujo de trabajo reproducible para investigar sistemas desde su comportamiento observable y sus artefactos, hacia una explicación de arquitectura respaldada por evidencia.

## 1. Resultado deseado

Bladi 3AI tendrá una capacidad reutilizable para iniciar una investigación de ingeniería inversa sobre un objetivo autorizado, preservar la muestra original, reunir metadatos verificables, elegir herramientas apropiadas según el tipo de objetivo, registrar hipótesis y producir un informe que separe hechos, inferencias y preguntas abiertas.

No se promete recuperar el código fuente original ni desmontar automáticamente cualquier sistema. La descompilación puede ser parcial y las conclusiones deben indicar sus límites.

## 2. Alcance de la primera versión

### Incluido
- Una skill operativa ampliada en `.agents/skills/ingenieria-inversa-educativa/`.
- Un CLI Python basado únicamente en la biblioteca estándar para triage estático seguro: hashes SHA-256, tamaño, firma/tipo probable, metadatos básicos de archivos, inspección limitada de contenedores ZIP/APK sin extraerlos ni ejecutarlos, lista de entradas y detección de rutas sospechosas dentro del archivo.
- Salida legible por terminal y JSON para que otra skill/agente pueda continuar el análisis.
- Plantilla de informe con alcance, cadena de custodia básica, evidencia, hipótesis, hallazgos, confianza, limitaciones y pasos siguientes.
- Guía de selección de herramientas por plataforma.
- Pruebas automatizadas con fixtures sintéticos y muestras inocuas; validación en CI.
- Actualización del catálogo de skills para que los agentes encuentren esta capacidad.

### Fuera del alcance inicial
- Ejecutar automáticamente binarios, APKs, scripts o muestras desconocidas.
- Instalar herramientas de análisis en el runner de CI o en el teléfono del usuario.
- Instrumentar aplicaciones en vivo de forma automática, evadir controles de acceso, extraer secretos, eludir licencias/DRM o atacar servicios de terceros.
- Afirmar que el código descompilado es idéntico al fuente original.
- Subir muestras privadas a servicios externos o enviar telemetría sin consentimiento.

## 3. Flujo de trabajo propuesto

1. **Definir alcance:** objetivo, propiedad/autorización, propósito, entorno permitido y preguntas a responder.
2. **Preservar:** trabajar sobre una copia, registrar nombre/tamaño/hash SHA-256 y no modificar el original.
3. **Triage estático:** identificar formato probable y metadatos; para ZIP/APK, listar contenido de forma segura sin extraer ni ejecutar.
4. **Elegir herramienta especializada:** usar el análisis más sencillo que responda a la pregunta; documentar versión y comandos.
5. **Análisis estático especializado:** revisar estructura, recursos, símbolos, bytecode, dependencias y flujo de control cuando la herramienta y el formato lo permitan.
6. **Análisis dinámico opcional:** solo en un laboratorio aislado, con autorización y sin datos reales; documentar las condiciones de ejecución.
7. **Correlacionar evidencia:** distinguir observaciones directas, inferencias y conjeturas; asignar confianza y buscar explicaciones alternativas.
8. **Reconstruir el modelo:** diagramar componentes, entradas/salidas, flujos de datos, dependencias y límites conocidos.
9. **Validar:** intentar refutar hipótesis con una segunda evidencia o una prueba reproducible.
10. **Entregar:** informe, hashes, herramientas/versiones, comandos reproducibles, limitaciones y recomendaciones.

## 4. Herramientas de referencia

Se elegirán según el caso; no se instalarán todas automáticamente.

| Tipo de objetivo/pregunta | Herramienta de referencia | Papel |
|---|---|---|
| Ejecutables compilados y análisis de bajo nivel | Ghidra | Desensamblado, descompilación, gráficos y análisis de binarios |
| Android APK/DEX y recursos | JADX | Decompilación aproximada de bytecode Android y lectura de recursos |
| Comportamiento en ejecución | Frida | Instrumentación dinámica en un entorno propio/autorizado |
| Protocolos y tráfico observable | Wireshark | Captura y análisis de paquetes accesibles; TLS cifrado puede limitar la visibilidad |
| Código fuente disponible | Herramientas nativas del lenguaje, buscadores y pruebas | Reconstruir llamadas, módulos, dependencias y comportamiento |

Fuentes oficiales:
- Ghidra: https://github.com/NationalSecurityAgency/ghidra
- JADX: https://github.com/skylot/jadx
- Frida: https://frida.re/docs/
- Wireshark: https://www.wireshark.org/docs/

## 5. Diseño del CLI inicial

Interfaz propuesta (nombres exactos a confirmar en el plan de implementación):

- `python3 scripts/re_triage.py inspect <archivo> [--json <ruta>]`
  - No ejecuta la muestra ni la extrae.
  - Informa ruta resuelta, tamaño, SHA-256, primeros bytes de firma, tipo probable y notas de límites.
  - Si detecta un contenedor ZIP/APK, lista entradas y metadatos limitados.
  - Rechaza rutas inexistentes, archivos no regulares y archivos por encima de un límite configurable razonable.
  - Maneja archivos ZIP dañados, entradas duplicadas y rutas internas absolutas o con `..` sin escribirlas al disco.
- `python3 scripts/re_triage.py --help`
  - Explica uso y límites de seguridad.

El CLI no debe afirmar que una muestra es segura o maliciosa basándose solo en su extensión o firma. La salida es triage preliminar, no un veredicto.

## 6. Estructura de archivos propuesta

- `.agents/skills/ingenieria-inversa-educativa/SKILL.md` — flujo operativo y reglas de selección.
- `.agents/skills/ingenieria-inversa-educativa/re-tooling.md` — herramientas, capacidades y límites.
- `scripts/re_triage.py` — triage estático de solo lectura.
- `tests/test_re_triage.py` — pruebas unitarias con archivos sintéticos.
- `docs/reverse-engineering/REPORT-TEMPLATE.md` — plantilla de informe.
- `docs/reverse-engineering/USAGE.md` — ejemplos, interpretación de salida y límites.
- `.github/workflows/validate-skills.yml` — ampliar CI con pruebas del CLI y validaciones de sintaxis sin ejecutar muestras.

La implementación debe conservar el trabajo previo, especialmente la skill existente y el paquete original Anatomy. No se reemplazarán ni borrarán fuentes originales.

## 7. Seguridad, legalidad y privacidad

- Exigir autorización y alcance definidos antes de analizar un sistema que no sea del usuario.
- No pedir ni guardar credenciales, tokens, claves privadas o datos personales descubiertos en muestras.
- No ejecutar muestras desconocidas en el equipo principal; no extraer archivos por defecto.
- No evadir controles de acceso ni facilitar robo de secretos, malware, persistencia encubierta o acceso no autorizado.
- Minimizar datos, mantener las muestras locales y no transmitirlas a servicios externos por defecto.
- Tratar cualquier hallazgo como sensible y redactar secretos en los informes.
- Registrar qué no se pudo analizar y por qué.

## 8. Criterios de aceptación

1. La skill explica el flujo completo y cuándo usar cada herramienta.
2. El CLI calcula correctamente SHA-256 y tamaño en archivos de prueba.
3. El CLI identifica de forma prudente algunos formatos conocidos sin depender solo de la extensión.
4. Un ZIP/APK sintético se inspecciona sin extraerse ni ejecutarse.
5. Entradas ZIP con rutas absolutas o segmentos `..` se reportan como sospechosas y nunca se escriben al disco.
6. Archivos inexistentes, ZIP dañados, archivos vacíos y límites de tamaño producen errores controlados y útiles.
7. La salida JSON es válida y estable para los campos documentados.
8. Las pruebas se ejecutan en CI usando solo archivos sintéticos; no se descargan ni ejecutan muestras reales.
9. El informe separa evidencia, inferencia, confianza y limitaciones.
10. El catálogo apunta a la skill ampliada y las validaciones existentes siguen pasando.
11. Se informa con precisión qué pruebas pasaron y qué no se ha probado en un dispositivo/laboratorio real.

## 9. Fases propuestas

- **Fase A — Base segura:** skill, guía de herramientas y plantilla de informe.
- **Fase B — Triage reproducible:** CLI estático y pruebas unitarias.
- **Fase C — Integración:** CI, catálogo, documentación y verificación final.
- **Fase D — Validación práctica posterior:** probar con un archivo benigno propio/autorizado y registrar el resultado, sin afirmar compatibilidad universal.

## 10. Decisiones pendientes para la revisión

- Confirmar que la primera versión sea un kit de análisis seguro y reproducible, no un instalador automático de herramientas pesadas.
- Confirmar que el CLI inicial sea de solo lectura y sin dependencias externas.
- Mantener el análisis dinámico como procedimiento manual y aislado hasta diseñar una fase específica.
