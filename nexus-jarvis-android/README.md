# Nexus Jarvis Android v0.1

Primer núcleo Android independiente para el proyecto Jarvis/Nexus.

## Incluye
- Interfaz oscura futurista con orb/HUD animado.
- Voz en español con SpeechRecognizer.
- Respuesta hablada con TextToSpeech.
- Router local para hora, linterna, cámara, temporizadores y búsquedas web.
- Acciones sensibles no se ejecutan automáticamente.
- Separación preparada para añadir después la inteligencia de Nexus AI Hub.
- Sin claves API embebidas.

## Compilación
Requiere JDK 17 y Android SDK 35. El workflow de GitHub Actions construye el APK debug automáticamente.

Salida esperada:
app/build/outputs/apk/debug/app-debug.apk

Este v0.1 no sustituye ni modifica el Nexus AI Hub existente.
