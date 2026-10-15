---
name: hackeo-etico-laboratorio
description: Metodología reutilizable de red team y auditoría ofensiva para CTF, laboratorios propios y artefactos autorizados; prioriza evidencia reproducible, contención y reparación.
---
# Hackeo ético en laboratorio

## Principio operativo
Trabajar con el ciclo: observar → formular hipótesis → investigar → experimentar en un laboratorio autorizado → aprender del resultado → cambiar de estrategia → documentar → volver a probar. Ser creativo y persistente, pero no saltarse el alcance autorizado.

## Flujo de trabajo
1. Definir objetivo, propietario, autorización, límites, datos prohibidos y criterios de parada.
2. Preservar el original y registrar hash, tamaño, fecha, procedencia y versiones de herramientas.
3. Comenzar con análisis estático y de solo lectura; validar las herramientas con fixtures sintéticos antes de usar muestras reales.
4. Separar hechos observados, inferencias e incógnitas. Buscar evidencia contradictoria y considerar falsos positivos.
5. Crear pruebas pequeñas, reproducibles y aisladas. No ejecutar APK desconocidos en el teléfono principal.
6. Para auditorías de un teléfono propio, usar únicamente herramientas autorizadas y lecturas de metadatos; el propietario debe aprobar explícitamente cualquier conexión ADB.
7. Registrar hallazgos con severidad, confianza, impacto, evidencia y reparación recomendada.
8. Volver a ejecutar las pruebas tras cualquier cambio y conservar una vía de reversión.

## Uso con ARK / APK Android
- Primera pasada: scripts/re_triage.py.
- Segunda pasada: scripts/apk_static_inspect.py para inventario acotado, cadenas DEX, cadenas imprimibles nativas y pistas Unreal.
- Flujo de inicio: scripts/FreeARK4Fun_startup_trace.py, si la copia local de la herramienta está disponible.
- Auditoría opcional de dispositivo: scripts/android_device_audit.py --package <id> requiere ADB instalado y autorización del dueño; consulta solo metadatos del paquete indicado.
- Usa Analizador Pro Móvil para una primera revisión local de archivos/código y correlaciona sus indicios con el informe Python. No confundas coincidencias de cadenas con prueba de comportamiento.

## Límites
- Solo CTF, laboratorio propio, muestras autorizadas y dispositivos cuyo dueño haya dado permiso.
- No robar cuentas, claves, tokens ni datos privados.
- No construir malware, persistencia, exfiltración ni acceso remoto encubierto.
- No desarrollar ni aplicar bypasses de firma, instalación, licencia o validación de claves. Se pueden identificar y documentar sus indicios, proponer mitigaciones y crear implementaciones independientes para funciones legítimas.
- No probar servidores públicos, otros jugadores o servicios de terceros sin autorización explícita.
- No instalar, ejecutar, modificar o resignar la muestra salvo que se establezca un alcance separado, explícito y un laboratorio aislado; el flujo predeterminado es estático y no destructivo.

## Formato del informe
- Alcance y autorización
- Identidad de la muestra (SHA-256)
- Herramientas y versiones
- Hechos observados
- Inferencias y confianza
- Limitaciones y pruebas pendientes
- Riesgo y recomendación
- Evidencia reproducible y pasos de reversión
