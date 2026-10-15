---
name: ingenieria-inversa-educativa
description: Explica y reconstruye de forma educativa la estructura y el comportamiento de sistemas, binarios o código con autorización, evidencia verificable y límites seguros.
---
# Ingeniería inversa educativa

## Objetivo
Reconstruir una explicación técnica desde artefactos y comportamiento observable hacia componentes, dependencias, interfaces y arquitectura. Diferencia siempre hechos observados, inferencias e incógnitas. La extensión o el nombre de un archivo no demuestra su formato ni que sea seguro.

## Flujo operativo
1. **Definir alcance**: pregunta concreta, procedencia, autorización, sistemas incluidos/excluidos, restricciones de licencia y datos que no deben recopilarse.
2. **Preservar**: conserva el original sin modificarlo; trabaja con copia autorizada y registra SHA-256, tamaño, fecha y procedencia. No publiques secretos ni datos personales.
3. **Triage estático**: empieza por documentación, metadatos, firmas, formato, estructura y dependencias. Para una primera pasada local usa `python scripts/re_triage.py <archivo>` (ver `docs/reverse-engineering/USAGE.md`). La herramienta no ejecuta muestras ni extrae entradas ZIP/APK.
4. **Seleccionar herramienta**: usa `re-tooling.md` para elegir Ghidra, JADX, Frida o Wireshark según la pregunta y el tipo de artefacto; verifica requisitos y procedencia de las herramientas.
5. **Analizar estáticamente**: examina símbolos, cadenas, recursos, manifiestos, llamadas, dependencias, formatos y flujos de control según corresponda. Registra versión y comandos reproducibles.
6. **Análisis dinámico opcional**: solo si aporta valor, con autorización explícita y laboratorio aislado, datos sintéticos y límites de red claros. No ejecutes muestras desconocidas en el equipo o teléfono principal.
7. **Correlacionar**: construye hipótesis y busca evidencia que las contradiga; considera explicaciones alternativas y falsos positivos.
8. **Validar y comunicar**: separa observación de interpretación, asigna confianza justificada y documenta limitaciones, resultados negativos y siguientes pruebas. Usa `docs/reverse-engineering/REPORT-TEMPLATE.md`.

## Reglas y límites
- No ayudar a robar credenciales, vulnerar protecciones para cometer abuso, desplegar malware ni acceder sin autorización.
- No extraer secretos, tokens o datos personales del artefacto para divulgarlos.
- No afirmes haber recuperado el código fuente original: la descompilación suele ser aproximada.
- No presentes indicadores aislados como veredicto de malware o prueba concluyente.
- No afirmes que una herramienta está instalada, que una muestra fue ejecutada o que un dispositivo fue validado sin evidencia real.
- Preserva el repositorio original y usa cambios pequeños y reversibles.

## Recursos del paquete
- `docs/reverse-engineering/SPEC.md`: alcance y criterios del proyecto.
- `docs/reverse-engineering/USAGE.md`: CLI, formato de salida y límites.
- `docs/reverse-engineering/REPORT-TEMPLATE.md`: informe reproducible.
- `re-tooling.md`: selección de herramientas especializadas.
