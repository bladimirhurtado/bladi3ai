# FreeARK4Fun.apk — fase 3: formato de activación y flujo nativo

**Fecha:** 2026-10-15  
**Alcance:** análisis estático adicional de `libuli.so` y correlación con la información del código recibido por el usuario.  
**Seguridad:** el APK no se instaló ni ejecutó; no se contactó ningún servidor; el artefacto original no se modificó.

## Identidad del artefacto

- Archivo: `FreeARK4Fun.apk`
- Tamaño: 43,789,803 bytes
- SHA-256: `11e73046f39a60c1d4b66c29c74f4817a24692b276e0c165ba4d39f81131aa6b`
- Biblioteca inspeccionada: `lib/arm64-v8a/libuli.so` (392,064 bytes)
- Arquitectura de la biblioteca: ELF64 AArch64

## Nueva evidencia de `libuli.so`

Se identificaron exportaciones JNI para `GetURL`, `nativeVerifyKey`, `nativeIsValidated`, `nativeClearMemory` y `Key.sendToCpp`.

### `nativeVerifyKey`

La desensamblación estática muestra operaciones consistentes con:
1. Recibir y convertir dos argumentos de texto de Java a cadenas nativas.
2. Construir una tabla de búsqueda de 64 valores y recorrer el primer argumento para decodificarlo con un formato tipo Base64.
3. Transformar el contenido decodificado con datos embebidos ofuscados.
4. Buscar un separador `_` en el resultado y dividir/procesar segmentos.
5. Actualizar estado nativo de validación y devolver un resultado al código Java.

**Interpretación prudente:** la clave parece tener estructura interna y no ser simplemente una contraseña de texto plano. El método recibe dos argumentos de texto, lo que es compatible con una comprobación que toma la clave y otro valor (posiblemente el código del dispositivo), pero el mapeo exacto debe confirmarse con una descompilación DEX completa. No se ha derivado, fabricado ni validado ninguna clave.

La tabla de decodificación se construye desde datos embebidos y podría utilizar un alfabeto personalizado. Por eso, que un código tenga caracteres compatibles con Base64 estándar o que el decodificador estándar produzca bytes no demuestra que el APK lo acepte.

### `GetURL` y conexión HTTP

`GetURL` transforma datos embebidos ofuscados antes de devolver una cadena a Java. El código Java llama después a `URL`, `openConnection`, establece tiempos de espera y lee líneas HTTP en un hilo separado. No se ha recuperado de forma fiable la URL final y no se hizo ninguna solicitud de red.

En la ruta estática de `nativeVerifyKey` no se identificó una llamada directa evidente a funciones HTTP. Esto sugiere que la comprobación de la clave podría procesarse localmente, mientras que la ruta `GetURL`/HTTP sirve para obtener enlaces, pero sigue siendo una hipótesis hasta completar la reconstrucción del flujo.

## Evaluación del código recibido

El usuario informó que un tercero le pasó un código de 40 caracteres y que ese tercero lo recibió del vendedor del APK. La cadena usa caracteres compatibles con el alfabeto Base64 estándar y la decodificación estándar produce 30 bytes binarios; no produce una contraseña legible.

Esto **es compatible con un token codificado**, pero no prueba que sea una clave válida para esta versión ni para el código de dispositivo del usuario. El segundo argumento que llega al verificador nativo es `mDeviceCode`, así que si el vendedor generó el token para el dispositivo del remitente, no debe esperarse que funcione en otro dispositivo. Como el APK parece utilizar una tabla de decodificación posiblemente personalizada, la prueba Base64 estándar no basta para validar el formato.

El valor completo del token se omite de este informe y no debe registrarse en repositorios. Trátese como una credencial: no publicarlo en issues, chats públicos o commits.

## Flujo de activación reconstruido

1. `MainActivity.onCreate` conduce a `Load.Init`.
2. El inicio llama a `Key.generate`, construye `LoadKey`, recupera una clave guardada y pasa por `nativeVerifyKey`.
3. `Key.generate` consulta `Settings.Secure.ANDROID_ID` y aplica SHA-256 a una cadena construida con ese valor y otros componentes.
4. La interfaz muestra estados de clave vacía, inválida o caducada. El texto de caducidad menciona un comando `/regenerate` en Discord y un código del usuario.
5. Una clave introducida se guarda en `SharedPreferences` (`ark_prefs`, `saved_key`).
6. La ruta `fetchLinks` hace una solicitud HTTP mediante una URL obtenida de `GetURL`; el endpoint sigue sin confirmar.

## Conclusiones y confianza

- **Alta confianza:** existe una ruta nativa específica para verificar la clave; el código usa una transformación tipo Base64 y procesamiento estructurado del contenido.
- **Alta confianza:** el APK deriva un código relacionado con `ANDROID_ID`, ofrece un flujo de activación/renovación y pasa `mDeviceCode` al verificador junto con la clave.
- **Alta confianza:** la validación está vinculada al código de dispositivo suministrado; no está confirmado si también hay fecha de caducidad dentro del token, aunque la interfaz muestra un estado de clave caducada.
- **No confirmado:** si el código recibido es válido, si fue emitido para este dispositivo, cuál es el endpoint de activación, qué datos envía el cliente o si el APK está libre de malware.

## Próximo paso legítimo y práctico

1. No instalar esta copia en el teléfono principal mientras la procedencia siga sin verificarse.
2. Pedir al vendedor que confirme por escrito que el token es válido para la versión `2.0.29` y que lo emita para el código que muestra el dispositivo del usuario. El análisis estático confirma que el verificador recibe ese código de dispositivo como argumento.
3. Si el vendedor sostiene que el token ya es correcto, solicitar instrucciones oficiales de activación o un mecanismo de soporte/reemisión; no publicar el código en abierto.
4. Para comprobarlo técnicamente, usar una copia de laboratorio aislada y autorización del propietario del software, sin cuentas reales ni eludir la validación.
5. Para elevar la confianza en la procedencia, obtener una distribución verificable y comparar la firma con una fuente oficial; la firma del archivo actual sigue siendo una preocupación documentada en la fase 2.

## Limitaciones

- No se dispone de JADX, apktool, apksigner ni un descompilador ARM64 de alto nivel en el entorno utilizado.
- Se inspeccionó la desensamblación de la biblioteca nativa, pero no se reconstruyó por completo el grafo de flujo ni se confirmó la firma DEX completa del método.
- No se ejecutó el APK, no se realizó análisis dinámico y no se conectó con el endpoint ofuscado.
- No se probó ni se afirmó la validez del token recibido.
