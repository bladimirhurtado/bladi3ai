# Informe de investigación: Anatomy

- Fecha de inspección: 2026-10-31
- Repositorio de trabajo: `bladimirhurtado/bladi3ai`
- Skill instalada: `.agents/skills/anatomy/`
- Versión declarada por el paquete upstream: **1.1.0**
- Licencia declarada: **MIT**
- Commit del repositorio de trabajo observado durante la inspección: `97ec7fed79f4df3e365177c5c1796d09c6c8be6f`
- Archivo principal inspeccionado: `.agents/skills/anatomy/SKILL.md`
- README upstream inspeccionado: `.agents/skills/anatomy/README.md`

## 1. Identidad y propósito correcto

Anatomy es una Agent Skill para explicar ideas técnicas construyendo objetos físicos ilustrados: figuras isométricas muy detalladas, interactivas y funcionales. No es, por sí misma, un motor de ingeniería inversa ni un analizador de APK.

Produce principalmente:
- SVG isométrico con piezas sólidas, sombreado y orden de dibujo.
- SVG combinado con WebGL para efectos como fuego, agua, luz, vapor y reflejos.
- Modo 3D experimental/beta para piezas móviles en tres dimensiones.
- Páginas HTML autónomas y componentes para React/Next.js, según las instrucciones del paquete.

Principio de diseño: **el objeto es la explicación**. En lugar de limitarse a cajas y flechas, representa un mecanismo reconocible cuyo funcionamiento comunica el concepto.

## 2. Estructura y módulos examinados

### Núcleo geométrico y auditoría
- `kit/iso-kit.mjs`: API principal del kit; construcción de geometría, proyección y utilidades para figuras.
- `kit/audit.mjs`: auditoría geométrica y de consistencia de las figuras. Se inspeccionaron sus exportaciones y lógica general.
- `kit/lathe.mjs`: operaciones geométricas para perfiles curvos, superficies torneadas y piezas redondas.
- `kit/tube.mjs`: geometría de tubos y recorridos.
- El código de auditoría contiene funciones para revisar holguras, solapamientos, profundidad/orden de dibujo, terminales y montajes de tubos, extremos sueltos, soportes, pliegues, curvatura, cobertura y estabilidad geométrica, entre otras.

### Scripts auxiliares examinados
- `scripts/capture.mjs`: abre HTML/SVG/URL en Chrome sin interfaz, toma capturas, permite seleccionar o ampliar regiones, emular tema/reducción de movimiento y reporta errores de consola/excepciones y desplazamiento horizontal.
- `scripts/drive.mjs`: automatiza interacción con la figura en Chrome: mover, hacer clic, arrastrar, escribir teclas, esperar, evaluar expresiones, tomar capturas y probar fallback sin WebGL.
- `scripts/lines.mjs`: comprueba que los extremos de las líneas de textura/detalle queden conectados a trazos, puntos o contornos; puede marcar fallos en una captura.
- `scripts/chrome-port.mjs`: auxiliar utilizado por los scripts de navegador para obtener el puerto de depuración de Chrome.
- `references/verify.md`: documentación del flujo de verificación visual e interactiva.
- `references/kit.md`: referencia del kit consultada como parte del inventario.

### Ejemplo inspeccionado
- `examples/dial-indicator/build.mjs`: ejemplo de construcción de un indicador de carátula con base, soporte, dial, carro y bloques. Sirve como punto de partida pequeño para comprender el patrón de construcción.

## 3. Qué puede aportar a los proyectos Bladi 3AI

### ARK
Uso recomendado, como herramienta complementaria:
- Convertir hallazgos ya confirmados en diagramas isométricos y explicaciones visuales.
- Representar módulos, componentes, conexiones o secuencias cuando exista evidencia suficiente para modelarlos.
- Comunicar hallazgos complejos de forma más comprensible.

Límite: Anatomy no descubre automáticamente la arquitectura real de una aplicación, no descompila APKs, no rastrea llamadas ni demuestra comportamiento interno. Esos hallazgos deben proceder de herramientas de análisis e ingeniería inversa; Anatomy los puede representar después.

### REA
Uso recomendado:
- Crear visualizaciones técnicas e interactivos explicativos.
- Representar mecanismos, flujos y relaciones entre componentes.
- Preparar material visual para documentación y aprendizaje.

### QA de visualizaciones
Uso recomendado:
- Ejecutar auditorías geométricas del modelo.
- Revisar conexión de líneas y detalles.
- Capturar la figura en escritorio/móvil, tema claro/oscuro y estados interactivos.
- Comprobar fallback sin WebGL y movimiento reducido cuando aplique.

Límite: estas comprobaciones validan la figura y su representación; no equivalen a pruebas de seguridad, corrección funcional del producto ni auditoría general de software.

## 4. Requisitos y ejecución esperada

El paquete declara:
- Node.js **20.10 o posterior**.
- Chrome o Chromium para las comprobaciones de navegador.
- Kit sin dependencias externas para el uso básico, según README upstream.

Comandos documentados en el paquete:
- Construir ejemplo: `node examples/<nombre>/build.mjs`
- Construir tema claro: añadir `--light`.
- Auditoría de ejemplo cuando está implementada: `node build.mjs --audit`.
- Captura: `node scripts/capture.mjs <archivo.html|archivo.svg|url> --out <captura.png>`.
- Interacción automatizada: `node scripts/drive.mjs <archivo.html> '<acciones JSON>'`.
- Verificación de líneas: `node scripts/lines.mjs <archivo.html>`.

Antes de ejecutar, comprobar rutas y comandos exactos del ejemplo seleccionado y leer las instrucciones completas de `SKILL.md` y `references/verify.md`.

## 5. Estado de verificación al 2026-10-31

### Inspección completada
- Se leyó el `SKILL.md` instalado.
- Se inspeccionó el README del paquete.
- Se recuperaron e inspeccionaron los módulos `iso-kit.mjs`, `audit.mjs`, `capture.mjs`, `drive.mjs`, `lines.mjs` y el ejemplo `dial-indicator/build.mjs`.
- Se consultaron `references/verify.md` y `references/kit.md).
- Se revisó el changelog upstream: la versión 1.1.0 está fechada 2026-10-12; incluye mejoras de soporte para OpenCode/Codex y correcciones de las comprobaciones en Linux, entre otros cambios.

### Ejecución no completada en esta sesión
No se ejecutaron los scripts de Anatomy ni se generaron capturas nuevas en esta inspección. La lectura de archivos por el conector GitHub no proporciona una terminal para ejecutar Node.js. Se detectó un problema de conectividad al intentar obtener el repositorio para ejecución local.

### GitHub Actions del repositorio de trabajo
Se consultaron las ejecuciones más recientes observadas:
- `Validate Bladi 3AI`, run `41123104214`: completada con éxito. El job mostró pasos de validación de archivos requeridos, catálogo de skills y agente de desarrollo.
- `REA tests`, run `41123104313`: completada con éxito.

**Importante:** estas ejecuciones no se deben presentar como pruebas de Anatomy. No se confirmó que ejecutaran los ejemplos, auditorías o scripts de Anatomy.

## 6. Riesgos, límites y decisiones

1. No atribuir a Anatomy capacidades de ingeniería inversa, análisis de APK, descubrimiento automático de arquitectura ni seguridad que no ofrece.
2. No afirmar que los scripts pasan hasta ejecutarlos y conservar sus salidas/capturas.
3. Mantener el paquete upstream original intacto; registrar adaptaciones propias por separado.
4. No añadir Anatomy al flujo principal de ARK como dependencia obligatoria: usarla como generador/validador visual opcional.
5. Al evaluar la integración, comprobar compatibilidad real del entorno de ejecución y del navegador.
6. Distinguir siempre: inspección estática del código, ejecución de pruebas, resultado observado y conclusión.

## 7. Plan de validación pendiente

En una sesión con acceso al repositorio en un entorno Node.js:
1. Confirmar commit y estado Git antes de ejecutar.
2. Verificar versiones de Node y Chrome/Chromium.
3. Construir `dial-indicator` en tema oscuro y claro.
4. Ejecutar su auditoría si el ejemplo expone `--audit`.
5. Construir un ejemplo más complejo (preferiblemente `raptor-engine`) y ejecutar su auditoría.
6. Ejecutar `capture.mjs` en escritorio y ancho móvil; inspeccionar las imágenes generadas.
7. Ejecutar `drive.mjs` para una interacción real y comprobar errores de consola/excepciones.
8. Ejecutar `lines.mjs` sobre las figuras seleccionadas.
9. Probar fallback sin WebGL y reducción de movimiento cuando proceda.
10. Registrar comandos exactos, salidas, códigos de salida, capturas, fallos y limitaciones. No corregir silenciosamente archivos upstream; crear rama y diff pequeño antes de cualquier adaptación.

## 8. Decisión operativa

**Conservar Anatomy como skill upstream especializada en visualización técnica, geometría e ilustración interactiva.**

Responsabilidades recomendadas:
- Visualización técnica de hallazgos de ARK.
- Diagramas e interactivos de REA.
- Auditoría geométrica y verificación visual de las figuras que ella misma produce.

No es un sustituto de:
- Ingeniería inversa.
- Análisis estático/dinámico de aplicaciones.
- QA funcional de los productos.
- Auditoría de seguridad.

Este informe es el punto de continuidad para futuras sesiones. Antes de trabajar con Anatomy, leer este documento junto con `.agents/skills/anatomy/SKILL.md` y `references/verify.md`.
