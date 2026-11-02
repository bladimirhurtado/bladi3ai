# Diagnóstico rápido (2–5 minutos)

## Antes de tocar ajustes
Anotar hora, lugar general (casa/ventana/calle; no hace falta dirección exacta), si hay apagón, red indicada por Android (LTE/4G/3G/5G cuando se muestre), barras aproximadas, si funcionan llamadas/SMS y si otras aplicaciones cargan. Evitar compartir IMEI, IMSI, número de teléfono, tokens o capturas con datos personales.

## Árbol de decisión
1. **Sin señal o solo llamadas de emergencia:** probar un lugar abierto/cerca de ventana; confirmar que SIM está habilitada. Si persiste, no gastar tiempo en DNS o ajustes de juego: son capas distintas.
2. **Hay barras, pero ninguna app tiene Internet:** comprobar datos móviles/SIM seleccionada, límite de datos y aviso del operador; abrir dos destinos distintos. Una sola web fallida puede ser el sitio, no la conexión.
3. **Algunas apps funcionan, otras no:** sospechar DNS, ruta, VPN, filtro, problema del destino o servicio. No cambiar APN al azar. VPN solo como prueba temporal, si es legal, segura y realmente accesible; puede empeorar latencia.
4. **Internet funciona, pero es lento o se corta:** comparar el teléfono en dos ubicaciones a pocos metros, sin cambiar otras variables; probar a otra hora si es viable. Puede ser cobertura interior o congestión.
5. **Solo falla ARK:** consultar el documento de diagnóstico ARK; no concluir que la señal celular sea la causa.
6. **Resultado inconsistente:** repetir tres veces y registrar fallos, no elegir una única prueba exitosa.

## Orden de pruebas, de menor coste a mayor
A. Abrir una página ligera y otra independiente.  
B. Desactivar temporalmente VPN/DNS privado solo si están activos y anotar su estado original; después restaurarlo.  
C. Cambiar el teléfono de posición/ubicación sin tapar la zona de antenas y repetir.  
D. Activar modo avión 10–15 segundos y desactivarlo una sola vez si la conexión parece atascada; no repetirlo indefinidamente.  
E. Comparar en una hora distinta.  
F. Solo con una hipótesis concreta, revisar APN/selección de red o herramientas avanzadas.

## Métricas
- Latencia (ms): tiempo de respuesta; menor suele ser mejor, pero una prueba web aislada no representa todo el juego.
- Pérdida de paquetes (%): paquetes que no reciben respuesta; incluso poca pérdida repetida puede perjudicar un juego.
- Variación de latencia/jitter (ms): cuánto fluctúa la latencia.
- Estabilidad: cuántas de 3 pruebas cargan sin error y si la conexión se mantiene.
- Velocidad: útil para descargas, menos decisiva que pérdida y latencia para jugar.
- Resultado ARK: inicio de sesión, listado de servidores, entrada al servidor, desconexiones.

Android puede bloquear ping, métricas de radio o ejecución en segundo plano; una medición fallida no demuestra por sí misma que no haya Internet.