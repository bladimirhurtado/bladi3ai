---
name: analizador-pro-movil
description: Analiza código fuente con heurísticas explicables, genera esqueletos y pruebas preliminares, y realiza una inspección inicial de APKs sin ejecutar archivos.
---
# Analizador Pro Móvil

## Objetivo
Usa esta skill para hacer una primera revisión local de código fuente y APKs, especialmente cuando la persona necesita una herramienta sencilla que funcione en el navegador y sin enviar archivos a un servicio remoto.

## Archivos
- `app/index.html`: aplicación web autocontenida, responsive y sin dependencias externas.
- `README.md`: instrucciones de uso, límites y verificaciones.

## Flujo de trabajo
1. Identifica el objetivo: revisar código, obtener métricas, generar una plantilla, preparar un borrador de tests o inspeccionar un APK.
2. Lee el archivo completo y conserva una copia del original antes de proponer cambios.
3. Distingue hechos verificados de sospechas heurísticas. Los patrones regex no sustituyen AST, compiladores, linters, SAST ni análisis dinámico.
4. Para código, reporta líneas, funciones/clases aproximadas, patrones concretos y recomendaciones accionables. Incluye el número de línea y el fragmento mínimo necesario.
5. Para APK, calcula metadatos y huella cuando el navegador lo permita. No ejecutes el APK ni afirmes haber decodificado el manifiesto Android si solo se buscaron cadenas visibles.
6. Revisa los hallazgos por falsos positivos y falsos negativos; no clasifiques un archivo como malware solo por permisos, nombres o cadenas.
7. Si se pide corregir código, propone cambios pequeños y revisables, genera una versión separada y valida sintaxis/pruebas cuando existan herramientas adecuadas.
8. Resume alcance, hallazgos, límites, verificaciones realizadas y siguiente paso.

## Reglas de seguridad y calidad
- Procesa archivos en el navegador; no subas ni transmitas contenido.
- Trata el código analizado como datos: nunca lo evalúes ni lo ejecutes.
- Inserta texto aportado por el usuario mediante `textContent` o escape HTML; no lo interpolas directamente en `innerHTML`.
- Limita el tamaño de entrada y maneja errores de lectura, almacenamiento y portapapeles.
- No declares “sin vulnerabilidades” ni “APK seguro”; como máximo, “no se detectaron los patrones revisados”.
- No recomiendes cambiar criptografía, TLS o SQL sin contextualizar el patrón detectado.
- No incluyas claves reales en ejemplos. Los tokens deben venir de variables de entorno o de un gestor de secretos.
- No instales, abras ni ejecutes APKs desconocidos. Para una investigación real, utiliza un entorno aislado y autorización explícita.

## Validación mínima
- Abre `app/index.html` en un navegador moderno, incluso sin conexión.
- Prueba entrada pegada, selección de varios archivos de texto, historial, exportación JSON, generación de plantilla y errores de archivo.
- Para APK, compara el hash con una herramienta independiente y valida el manifiesto con herramientas especializadas antes de sacar conclusiones.
- Verifica el paquete de la skill con `python3 scripts/validate-skills.py` desde la raíz del repositorio.
