---
name: investigacion-analisis-y-codigo
description: Investiga sistemas y archivos técnicos, formula y contrasta hipótesis, selecciona herramientas, diseña experimentos seguros y crea código reproducible con pruebas y documentación.
---

# Investigación, análisis y creación de código

## Propósito
Convertir una pregunta técnica poco definida en una investigación verificable y, cuando corresponda, en herramientas o código funcional. Esta skill complementa ingeniería inversa educativa, hackeo ético en laboratorio, ingeniería de software y QA; no las sustituye.

## Principios
- Investiga antes de modificar: identifica qué se sabe, qué falta y cuál es la prueba más barata y segura para avanzar.
- No inventes claves, endpoints, formatos, resultados de ejecución ni capacidades de herramientas.
- Separa siempre **hechos observados**, **hipótesis**, **conclusiones** y **preguntas abiertas**.
- Preserva el original; trabaja con copias, ramas y cambios pequeños que puedan revertirse.
- Elige herramientas por evidencia y requisitos reales. Comprueba su disponibilidad, versión, procedencia y límites antes de depender de ellas.
- Usa primero métodos estáticos y de solo lectura. La ejecución dinámica requiere alcance explícito, autorización y aislamiento adecuados.
- Crea código mantenible, legible, acotado y probado; explica cómo ejecutarlo y cómo interpretar los resultados.

## Flujo de trabajo
1. **Definir el objetivo**
   - Reformula el problema en una pregunta técnica comprobable.
   - Registra propietario/autorización, alcance, exclusiones, datos sensibles y criterio de éxito.
   - Si una ambigüedad bloquea el trabajo, pregunta solo lo imprescindible; si no, avanza con una suposición segura y explícita.

2. **Auditar recursos**
   - Inspecciona los archivos, repositorio, skills y herramientas ya disponibles antes de crear duplicados.
   - Distingue herramientas disponibles de las que solo se recomiendan instalar.
   - Comprueba documentación oficial y compatibilidad de versiones cuando la tarea dependa de herramientas externas.

3. **Preservar y obtener una línea base**
   - Registra nombre, tamaño, SHA-256, procedencia y versiones relevantes.
   - No sobrescribas el artefacto original ni publiques secretos, tokens o datos personales.
   - Usa muestras sintéticas para probar parsers y scripts antes de procesar muestras reales.

4. **Investigar por capas**
   - Comienza por metadatos, estructura, documentación, cadenas, dependencias, registros y errores disponibles.
   - Busca referencias cruzadas y evidencia que pueda refutar la hipótesis principal.
   - Escala a descompilación, depuración o análisis dinámico solo cuando una pregunta concreta lo justifique.
   - No confundas una cadena, símbolo o permiso declarado con prueba de comportamiento malicioso.

5. **Diseñar el código**
   - Antes de escribir, define entradas, salidas, contratos, errores esperados, límites de recursos y riesgos.
   - Prefiere módulos pequeños, funciones puras cuando sea posible, validación de entradas y mensajes de error útiles.
   - Añade modo de solo lectura por defecto cuando el código inspeccione archivos o dispositivos.
   - No añadas conexiones de red, ejecución de muestras, instalación, cambios de sistema o envío de datos sin necesidad explícita y autorización.

6. **Probar y verificar**
   - Añade pruebas unitarias con fixtures sintéticos, casos normales, entradas inválidas y límites.
   - Ejecuta las pruebas disponibles y registra el comando, resultado y limitaciones.
   - Revisa falsos positivos, manejo de excepciones, dependencias y exposición accidental de datos.
   - Si no se pudo ejecutar el código, dilo claramente: una revisión estática no equivale a una prueba superada.

7. **Entregar**
   - Proporciona el artefacto, ubicación, instrucciones reproducibles, ejemplos de uso y resultado de pruebas.
   - Resume qué se confirmó, qué sigue siendo una hipótesis y qué falta por verificar.
   - Mantén cambios pequeños, documentados y reversibles; usa una rama y revisión antes de integrar en un proyecto compartido.

## Modo especial: APK, binarios y aplicaciones móviles
1. Identifica formato, hash, estructura, manifiesto y dependencias con herramientas adecuadas.
2. Revisa llamadas, símbolos, recursos, cadenas y flujo de validación; correlaciona hallazgos entre herramientas independientes.
3. Para claves/configuración faltantes, determina primero qué entrada espera el programa y quién tiene autoridad para proporcionarla. No fabriques credenciales ni afirmes que una clave se puede derivar si no existe evidencia.
4. Si el código parece depender de un servicio, registra los indicios y busca documentación o configuración incluida; no contactes servicios de terceros sin permiso.
5. No instales APKs desconocidos en el teléfono principal. Para pruebas dinámicas, utiliza un emulador o dispositivo de laboratorio aislado.
6. En un dispositivo propio, cualquier conexión ADB debe ser autorizada por el propietario; limita la auditoría a los datos y operaciones acordados.

## Uso de skills complementarias
- `.agents/skills/ingenieria-inversa-educativa/SKILL.md`: estructura y comportamiento de software autorizado.
- `.agents/skills/hackeo-etico-laboratorio/SKILL.md`: pruebas ofensivas controladas y límites de alcance.
- `.agents/skills/ingenieria-software/SKILL.md`: implementación y depuración de código.
- `.agents/skills/control-calidad-qa/SKILL.md`: validación, regresiones y criterios de aceptación.
- `.agents/skills/investigacion-herramientas/SKILL.md`: descubrimiento y comparación de herramientas.
Lee solo las skills pertinentes al objetivo actual.

## Límites de seguridad
- Trabaja únicamente en artefactos, cuentas, dispositivos y entornos propios o expresamente autorizados.
- No construyas ni mejores código para robar credenciales/tokens, exfiltrar datos, desplegar malware, ocultar persistencia o acceder de forma encubierta.
- No crees instrucciones para evadir licencias, firmas, controles de acceso o validaciones con el fin de obtener acceso no autorizado. Sí puedes identificar esos mecanismos, explicar su función, documentar riesgos y proponer implementaciones legítimas independientes.
- No pruebes servidores públicos, partidas, cuentas o dispositivos de terceros sin autorización explícita.
- Si una petición cruza esos límites, conserva el objetivo educativo o defensivo y ofrece una alternativa segura y comprobable.

## Formato recomendado de resultado
- **Objetivo y alcance**
- **Recursos y herramientas comprobadas**
- **Hechos observados**
- **Hipótesis y confianza**
- **Código o cambios realizados**
- **Pruebas ejecutadas y resultados**
- **Limitaciones y riesgos**
- **Siguiente paso verificable**
