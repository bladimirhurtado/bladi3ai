# Modo ARK Mobile 2.0

## Separar el síntoma
Registrar exactamente qué etapa falla:
1. autenticación Google Play Games;
2. pantalla/menú del juego;
3. actualización/listado de servidores;
4. conexión a un servidor concreto;
5. carga inicial y entrada al mundo;
6. desconexiones o lag una vez dentro.

Que el modo individual funcione demuestra que parte del juego puede ejecutarse localmente, pero no prueba que la red ni los servicios de autenticación estén sanos. Que una lista gire indefinidamente tampoco identifica por sí solo la causa.

## Prueba mínima
- Verificar si otras apps cargan en el mismo momento.
- Repetir ARK una vez en una ventana de conexión que ya funcione y registrar etapa/error exacto.
- Si existe una segunda red legítima disponible, comparar temporalmente sin alterar cuentas ni archivos del juego.
- Comparar, si es posible, otro servidor conocido y el mismo servidor en otro momento.
- Guardar hora, mensaje literal, duración y si el problema también le ocurre a otros jugadores. No descargar APK “fix”, modificadores ni herramientas de hacks.

## Interpretación
- Otras apps tampoco funcionan: investigar datos móviles/red antes que ARK.
- Internet general funciona, varias funciones online de ARK fallan: posibles servicios del juego, autenticación, DNS/ruta o versión; recopilar evidencia antes de cambiar ajustes.
- Solo un servidor falla: posible servidor o ruta específica; no asumir culpa del dispositivo.
- Login Google Play Games falla pero navegación funciona: rama independiente de autenticación/cuenta/compatibilidad.
- Lag dentro del mundo con latencia de red estable: investigar carga del servidor, estructuras, entidades, FPS y rendimiento local; no atribuir todo a los cables o a la señal.

## Evitar
No borrar datos del juego, reinstalar, cambiar cuenta o instalar APK adicionales como primera medida. Esas acciones pueden perder configuración/progreso y no prueban una hipótesis de red.

## Plan B
Si no hay conexión suficiente para probar, recopilar sin conexión el texto de error, la hora, la etapa del fallo y los resultados de intentos previos. Preparar una hipótesis priorizada y reanudar las pruebas cuando vuelva la red.