# Ejecutar REA desde Android (TCL 605)

Esta guía permite ejecutar el analizador estático `scripts/re_triage.py` directamente en Android, sin ordenador. No instala ni abre el APK que se analiza.

## 1. Preparar Termux

Instala **Termux** únicamente desde su fuente oficial:
- F-Droid: https://f-droid.org/packages/com.termux/
- GitHub oficial del proyecto: https://github.com/termux/termux-app

No mezcles Termux de distintas fuentes ni instales APK de páginas desconocidas. La instalación puede necesitar una conexión estable y espacio libre.

## 2. Instalar Python y Git

Abre Termux y ejecuta, una línea cada vez:

```sh
pkg update
pkg install python git
```

Si pregunta si desea continuar, revisa el mensaje y confirma. No hace falta root ni desactivar protecciones de Android.

## 3. Permitir acceso a archivos compartidos

Ejecuta:

```sh
termux-setup-storage
```

Cuando Android muestre el permiso, permite el acceso a archivos. El almacenamiento compartido suele quedar accesible en `~/storage/shared`; la carpeta Descargas suele ser `~/storage/downloads`.

**Importante:** Android puede bloquear `Android/data` y carpetas privadas de otras aplicaciones. No intentes saltarte ese bloqueo ni cambies permisos del sistema. Si el archivo está ahí, usa únicamente una opción normal de exportar/compartir de la aplicación propietaria para guardar una copia en Descargas, si la aplicación lo permite.

## 4. Descargar el analizador desde el repositorio

En Termux:

```sh
git clone https://github.com/bladimirhurtado/bladi3ai.git
cd bladi3ai
python scripts/re_triage.py --help
```

Si ya clonaste el repositorio antes, no repitas `git clone`; entra en la carpeta existente con `cd bladi3ai` desde el directorio donde la guardaste y actualiza con `git pull`.

## 5. Analizar un archivo guardado en Descargas

Primero comprueba el nombre exacto del archivo:

```sh
ls -lh ~/storage/downloads
```

Luego sustituye `NOMBRE.apk` por el nombre real:

```sh
python scripts/re_triage.py ~/storage/downloads/NOMBRE.apk --json
```

Para guardar el informe de texto JSON en Descargas:

```sh
python scripts/re_triage.py ~/storage/downloads/NOMBRE.apk --json > ~/storage/downloads/rea-informe.json
```

Si el nombre tiene espacios, pon la ruta entre comillas, por ejemplo:

```sh
python scripts/re_triage.py "$HOME/storage/downloads/mi archivo.apk" --json
```

## 6. Qué hace y qué no hace

- Calcula SHA-256, reconoce algunas firmas y revisa metadatos de archivos ZIP/APK.
- No ejecuta el APK, no extrae sus contenidos, no lo instala y no lo modifica.
- No demuestra por sí solo que un archivo sea seguro o malicioso.
- No descompila código Android ni lee archivos privados inaccesibles.
- El límite predeterminado de entrada es 64 MiB. Si el archivo supera el límite, el analizador lo rechazará; no aumentes el límite sin necesidad.

## 7. Para el archivo que estábamos investigando

Antes de ejecutar nada, comprueba que tienes una **copia del archivo original** en Descargas y que la ruta existe. Si solo aparece dentro de una carpeta privada con “Acceso denegado”, detente: este analizador no puede saltarse ese permiso. No borres datos de ARK ni de Google Play Games para intentar conseguirlo.

Empieza solo por los pasos 1–3. Si aparece un error, conserva el texto exacto y continúa desde ese punto; no ejecutes todos los comandos de golpe.
