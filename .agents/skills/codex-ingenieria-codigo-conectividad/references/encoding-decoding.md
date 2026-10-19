# Guía de codificación y descodificación para CODEX

## Identificar antes de transformar
Determina si los datos son bytes, texto, una estructura serializada, datos comprimidos, cifrados o un hash. No pruebes decodificadores al azar sobre datos sensibles.

## Herramientas/formas comunes
- UTF-8: texto a bytes.
- Hexadecimal: representación legible de bytes.
- Base64/Base64URL: representación de bytes, no cifrado.
- URL encoding: escape de caracteres para URLs.
- JSON/XML: estructuras con reglas sintácticas.
- TLV: tipo-longitud-valor; exige conocer el esquema.
- Binario: representación de bits/bytes, respetando endianness y anchuras.
- Checksums/hashes: verificación o huella; normalmente no son reversibles.
- Cifrado: requiere algoritmo, modo y clave legítima para recuperar el contenido.

## Verificación
1. Conservar la muestra original sin cambios.
2. Anotar tamaño y hash si procede.
3. Identificar formato y codificación con evidencia.
4. Transformar una copia y registrar cada paso.
5. Comparar salida con vectores de prueba conocidos.
6. Ejecutar round-trip cuando sea aplicable.
7. Informar bytes inválidos, pérdidas de información o ambigüedades.

No publicar secretos ni intentar descifrar datos ajenos sin autorización.
