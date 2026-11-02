# Monitor de conectividad Nexus (Android / Termux)

## Propósito
Comprobar cada cinco segundos si dos destinos HTTPS independientes responden y registrar el tiempo de respuesta y los fallos en CSV. Sirve para observar cortes generales o fallos hacia un destino; no mide directamente la radio LTE, la pérdida de paquetes ICMP ni el servidor de ARK.

## Requisitos
- Android con Termux instalado desde una fuente fiable.
- Python 3 en Termux.
- Datos móviles activados y Wi-Fi desactivado si se quiere medir la ruta móvil.

## Uso
1. Guarda `nexus_signal_monitor.py` en una carpeta accesible desde Termux.
2. Ejecuta `python nexus_signal_monitor.py`.
3. Déjalo funcionar durante un episodio de conexión mala durante 1–3 minutos; detener con Ctrl+C.
4. El archivo `nexus_signal_log.csv` queda en la carpeta desde la que se inició el programa.

## Interpretación rápida
- Ambos destinos fallan a la vez repetidamente: indicio de un problema de conectividad/ruta general, no prueba definitiva.
- Solo uno falla: puede ser un problema de ese destino, DNS o ruta.
- Ambos responden y ARK falla: investigar por separado inicio de sesión de Google Play Games, listado/entrada a servidores o estabilidad dentro de la partida.
- Respuestas lentas o con grandes variaciones: indicio de una ruta irregular; no equivale a medir la latencia real del servidor de ARK.

## Limitaciones y seguridad
- El sondeo HTTPS genera tráfico pequeño y periódico; no debe dejarse funcionando todo el día con datos móviles limitados.
- Los tiempos incluyen DNS, establecimiento TLS y respuesta HTTPS, por lo que no son una medición pura de latencia.
- Un bloqueo de un destino puede producir fallos aunque otras apps funcionen.
- No cambia APN, DNS, modo de red ni ajustes del teléfono; no requiere root y no borra datos.
- No promete mejorar ni amplificar físicamente la señal. Su función es aportar evidencia para escoger el siguiente paso.
