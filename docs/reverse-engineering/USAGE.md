# Uso del analizador de triage

El script `scripts/re_triage.py` realiza una inspección estática preliminar de un archivo local. Utiliza solo la biblioteca estándar de Python. **No ejecuta la muestra, no extrae archivos del ZIP y no modifica el archivo analizado.** No es un motor completo de ingeniería inversa ni un veredicto de malware.

## Requisitos

- Python 3.10 o posterior recomendado (usa anotaciones de tipos modernas).
- No requiere paquetes externos.
- Ejecutar desde cualquier directorio con la ruta correcta al script y al archivo.

## Ejemplos

Desde la raíz del repositorio:

```bash
python scripts/re_triage.py ./ruta/archivo.bin
python scripts/re_triage.py ./ruta/paquete.apk --json
python scripts/re_triage.py ./ruta/archivo.bin --max-bytes 10485760
python scripts/re_triage.py --help
```

Desde otro directorio, proporciona la ruta absoluta al script:

```bash
python /ruta/al/repositorio/scripts/re_triage.py /ruta/a/archivo.apk --json
```

## Salida JSON

En caso de éxito incluye:
- `status`: `ok`.
- `assessment`: advertencia de que el resultado es preliminar.
- `path`, `size_bytes`, `sha256`.
- `signature_guess`, `format_guess`, `extension_hint`.
- `notes`: avisos, incluidos desajustes entre extensión y firma.
- `archive`: `null` si no se identifica un ZIP; en caso contrario, metadatos limitados del directorio central, nombres, rutas sospechosas, nombres duplicados y ratios declarados altos.

Los errores incluyen `status: error` y un objeto `error` con `code` y `message`. Los códigos de salida son `0` si el análisis termina, incluso si un archivo no ZIP está dañado; `2` para errores controlados de entrada o límites. Un ZIP corrupto puede producir una nota de inspección fallida sin convertir automáticamente el archivo en error de entrada.

## Límites de seguridad

- Límite predeterminado: 64 MiB; puede ajustarse con `--max-bytes`.
- Hash SHA-256 calculado en bloques; si el archivo crece más allá del límite durante la lectura, se detiene con error.
- Solo se usa una pequeña cabecera para firmas.
- ZIP: no se leen los contenidos de las entradas ni se extraen archivos. El analizador limita la cantidad de entradas y la longitud acumulada de nombres; la lista de nombres mostrada se limita a 200.
- Los nombres absolutos, rutas con `..`, nombres duplicados y ratios de compresión declarados muy altos son señales para revisar, no prueba de explotación o malware.
- Los nombres y extensiones son indicios, no prueba de tipo real o seguridad.
- No se suben archivos ni se envían muestras a servicios externos.

## Comprobaciones de desarrollo

```bash
python -m unittest discover -s tests -v
python -m py_compile scripts/re_triage.py tests/test_re_triage.py
python scripts/validate-skills.py
```

Para análisis más profundo, usa herramientas especializadas solo con autorización y un alcance definido. Consulta `re-tooling.md` y la plantilla `REPORT-TEMPLATE.md`.
