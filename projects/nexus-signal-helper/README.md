# Nexus Signal Helper (Android)

Aplicación Android nativa mínima para facilitar la recuperación de una conexión móvil inestable sin Termux, Python, root ni permisos peligrosos.

## Qué hace
- Muestra el tipo de conexión activa que Android expone y si el sistema la considera validada para Internet.
- Ejecuta una prueba puntual de dos destinos HTTPS independientes, con timeout de 3 segundos, y muestra los tiempos.
- Ofrece un botón de recuperación que abre el panel nativo de Internet de Android. El usuario decide si desconecta y reconecta los datos móviles; Android no permite a una app normal activar/desactivar los datos móviles automáticamente.
- Copia el informe de prueba.

## Qué no puede hacer
No aumenta la potencia de la antena, no puede obligar a una torre de ETECSA a funcionar, no cambia bandas LTE ocultas, no altera APN/DNS ni garantiza que ARK deje de desconectarse. Una respuesta HTTPS buena no prueba que el servidor de ARK esté disponible; el fallo de un destino aislado tampoco demuestra por sí solo que no haya Internet.

## Compilación y APK
El flujo GitHub Actions compila el APK de depuración y publica el artefacto llamado nexus-signal-helper-debug-apk. El APK de depuración no está firmado para distribución comercial; Android puede advertir que es una instalación externa a Play Store.

## Prueba de campo
Usar con Wi-Fi apagado y datos móviles activos. Cuando ocurra el fallo:
1. Anotar el estado que muestra Android.
2. Pulsar una vez «Comprobar conexión».
3. Si hace falta intentar recuperación, pulsar «Recuperar conexión», abrir el panel del sistema y reconectar datos una sola vez.
4. Volver a probar. Si ambos destinos responden y ARK sigue fallando, dejar de ciclar la conexión y revisar por separado inicio de sesión, servidor/listado o estabilidad en partida.
