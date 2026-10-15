# FreeARK4Fun.apk — informe estático reproducible

## Alcance y preservación

- Se analizó una copia local en modo estático. No se instaló ni ejecutó el APK y no se realizaron conexiones de red.
- Archivo: FreeARK4Fun.apk
- SHA-256: 11e73046f39a60c1d4b66c29c74f4817a24692b276e0c165ba4d39f81131aa6b
- Tamaño: 43,789,803 bytes (aprox. 41.76 MiB)
- Contenedor ZIP: 233 entradas; 69 DEX; cuatro bibliotecas nativas; 18 entradas bajo assets.
- Identificador de paquete leído del manifiesto binario: com.survival.games
- Versión declarada: 2.0.29; versionCode 1927261; minSdk 24; targetSdk 33.

## Observaciones de alta relevancia

1. La clase com.uli.ark.uliAPK contiene métodos spoofSigningInfo y spoofInstallSource. La traza de llamadas muestra acceso reflectivo a ActivityThread e IPackageManager, y un proxy alrededor de consultas como getPackageInfo, getInstallerPackageName y getInstallSourceInfo. Esto respalda la hipótesis de que el paquete intenta modificar la información de firma/origen que devuelve Android.
2. El flujo de inicio observado es MainActivity.onCreate → Load.Init → Key.generate / LoadKey → nativeVerifyKey. El código consulta Settings.Secure.ANDROID_ID y aplica SHA-256 para derivar un código específico del dispositivo.
3. libuli.so exporta puntos JNI llamados GetURL, nativeVerifyKey, nativeIsValidated, nativeClearMemory y Key.sendToCpp. El análisis estático no ha confirmado el endpoint ni el protocolo real.
4. libGodOfGods.so incluye símbolos/rutas de recursos asociados con ARK/ShooterGame. El APK parece ser una distribución modificada, pero las funciones no se probaron dentro de un juego en ejecución.

## Permisos declarados en el manifiesto

- INTERNET, ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE
- READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE
- RECORD_AUDIO, MODIFY_AUDIO_SETTINGS, VIBRATE
- WAKE_LOCK, RECEIVE_BOOT_COMPLETED
- com.google.android.gms.permission.AD_ID
- com.android.vending.CHECK_LICENSE, com.android.vending.BILLING
- com.google.android.c2dm.permission.RECEIVE
- Permisos de insignias/launcher para varios fabricantes.

Que un permiso figure en el manifiesto no demuestra que esté concedido ni que la app lo utilice durante la ejecución. Los permisos antiguos de almacenamiento merecen especial atención en versiones modernas de Android. RECORD_AUDIO puede tener una razón legítima en un juego con voz, pero su uso no se verificó.

## Firma y procedencia

El informe previo encontró metadatos de firma JAR con SHA-1 y avisos de verificación bajo la política de seguridad moderna. No se ha comparado la huella con una distribución oficial fiable ni se ha verificado la firma mediante apksigner en este entorno. La procedencia del APK sigue sin estar demostrada.

## Evaluación provisional

**Riesgo de instalación: alto mientras no se verifique la procedencia.** La razón principal no es una cadena aislada, sino la combinación de mecanismos de alteración de información de firma/origen, puerta de acceso con validación nativa, identificador de dispositivo y procedencia no confirmada. No se ha demostrado robo de credenciales, exfiltración ni malware confirmado. Tampoco hay evidencia suficiente para declarar el archivo seguro.

Recomendación: no instalarlo ni introducir cuentas o credenciales reales en el TCL 605. Preferir una distribución verificable del editor legítimo.

## Auditoría del teléfono (paso separado)

El teléfono no está conectado a esta sesión, así que no se ha inspeccionado el dispositivo ni se puede afirmar que el paquete esté instalado. Si el propietario conecta su teléfono a un ordenador de confianza, instala ADB y aprueba la depuración USB, la herramienta de metadatos puede consultar únicamente este paquete:

    python3 scripts/android_device_audit.py --package com.survival.games --out android-device-audit.json

El script solo consulta propiedades básicas del dispositivo y metadatos del paquete; no lee datos privados de la aplicación ni modifica el teléfono. Si ADB no está disponible o el teléfono no está autorizado, la auditoría terminará con un error controlado.

## Herramientas y límites

- scripts/apk_static_inspect.py: inventario y análisis acotado de cadenas DEX/nativas.
- scripts/android_device_audit.py: metadatos del paquete instalado mediante ADB con autorización del propietario.
- FreeARK4Fun_startup_trace.py fue una herramienta de análisis local anterior; la traza es aproximada y no sustituye un descompilador.
- Las coincidencias de cadenas son indicadores; la evidencia de métodos y llamadas aporta más contexto, pero no demuestra por sí sola el comportamiento dinámico.
- No se recuperan claves, no se evaden validaciones, no se parchea ni se resigna el APK.
