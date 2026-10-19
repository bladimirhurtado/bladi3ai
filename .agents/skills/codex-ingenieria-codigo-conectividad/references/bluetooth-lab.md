# Guía de laboratorio Bluetooth para CODEX

## Antes de empezar
- Obtener autorización explícita y registrar el alcance del laboratorio/evento.
- Identificar el dispositivo de prueba, modelo, sistema operativo y versión Bluetooth.
- Confirmar si el objetivo usa Bluetooth Classic, BLE o ambos.
- Registrar operaciones permitidas: escaneo, emparejamiento, lectura, escritura, notificaciones y captura.
- No escanear ni conectar dispositivos ajenos fuera del alcance autorizado.

## BLE: secuencia recomendada
1. Verificar adaptador, permisos y estado Bluetooth.
2. Escanear durante una ventana breve y limitada.
3. Seleccionar únicamente el dispositivo autorizado.
4. Conectar y descubrir servicios GATT.
5. Registrar UUID de servicio/característica y propiedades disponibles.
6. Leer sólo características autorizadas; habilitar notificaciones cuando corresponda.
7. Escribir sólo en características de prueba aprobadas, usando valores inocuos documentados.
8. Probar desconexión, timeout, reconexión y respuestas malformadas.
9. Guardar resultados redactados y repetir para confirmar reproducibilidad.

## Bluetooth Classic
1. Verificar perfiles soportados por ambos extremos.
2. Emparejar mediante el flujo normal del sistema operativo.
3. Usar sólo el perfil/canal documentado y permitido (por ejemplo, SPP/RFCOMM si está disponible).
4. Probar framing, longitud máxima, delimitación de mensajes, timeouts y reconexión.
5. No asumir que un teléfono permite acceso a todos los perfiles: las APIs varían por plataforma.

## Matriz mínima de pruebas
- Descubrimiento de dispositivo autorizado: esperado/observado.
- Emparejamiento y autenticación: éxito/fallo controlado.
- Mensaje válido corto y largo: integridad del contenido.
- Codificación y descodificación round-trip: igualdad byte a byte.
- Perfil/característica no compatible: error seguro y legible.
- Desconexión durante intercambio: recuperación sin corrupción.
- Timeout o datos incompletos: manejo controlado.
- Reconexión: no duplicar operaciones ni filtrar datos.

## Evidencia
Registrar timestamp, versión, transporte, operación, resultado, error y hash de artefactos cuando ayude. Ocultar MAC, nombres personales, claves y tokens antes de compartir. Distinguir pruebas con hardware real de simulaciones.

## Nota de arquitectura
Bluetooth es sólo el transporte. El formato del mensaje, la autenticación, la integridad y la lógica de la aplicación deben definirse por separado. No garantiza anonimato ni evita por sí mismo la monitorización del sistema receptor.
