# ARK / REA — Punto de control
Fecha: 2026-10-30

Este documento conserva el estado del trabajo para poder retomarlo desde otro chat o después de una interrupción.

## Objetivo
Analizar ARK Mobile mediante REA desde un teléfono Android, avanzando de forma verificable y sin extraer ni modificar todo el paquete del juego.

## Entorno
- Teléfono: TCL 605, Android 15.
- Trabajo desde Termux; no hay ordenador disponible.
- Repositorio: https://github.com/bladimirhurtado/bladi3ai
- Rama: main.
- Carpeta local del repositorio: ~/bladi3ai
- Preferencia operativa: un paso por vez, comandos sencillos y comprobaciones visibles.

## Archivos de entrada y verificación
- Copia de WhatsApp DOC-20261026-WA0011.bin: 1,926,728,087 bytes (~1.8 GiB).
- MD5 cotejado con referencia facilitada: 8ce293488e58aff6811127705fd4f144.
- ZIP válido con 8 entradas; contiene ShooterGame/Content/Paks/pakchunk0-Android.pak, ArkIcon.png y seis archivos .ogg.
- Otra copia DOC-20261029-WA0007.bin: 440M; MD5 calculado 1603513512b0f4686b101baa14a432c3, sin hash de referencia para cotejar.
- El análisis de metadatos ZIP no encontró nombres duplicados, rutas sospechosas ni ratios anormales. Esto no equivale a certificar ausencia de malware.

## PAK e índice
- PAK interno: 1,893,901,747 bytes; almacenado sin compresión dentro del ZIP.
- Footer detectado: magic 0x5a6f12e1, versión 4.
- Índice: offset 1887768717; tamaño 6132985 bytes.
- SHA-1 esperado y calculado del índice coinciden: 3ab07a4377a4ae60f073159667028f958f562595.
- Mount point: ../../../
- Entradas declaradas y procesadas: 34.285.
- El parser consumió exactamente el tamaño del índice, sin errores.

## Inventario generado
Archivos:
- WhatsApp Sent/ARK-inventario.csv
- WhatsApp Sent/ARK-componentes.txt (3.091.382 bytes)
- En ~/bladi3ai: ARK-REA-analisis.txt
- En ~/bladi3ai: ARK-REA-analisis.json; comprobado el 2026-10-30 con ls -lh: 13 MB.

Estadísticas principales del inventario:
- 34.285 entradas.
- Tamaño original declarado total: 3.085.731.055 bytes.
- .uexp: 15.447 (2.856.949.903 bytes)
- .uasset: 15.014 (47.269.007 bytes)
- .res: 2.680
- .umap: 433
- .ubulk: 240
- .png: 214
- .locres: 119
- .ini: 45
- .uplugin: 25
- .uproject: 1

## Estado del análisis REA
El analizador scripts/ark_inventory_analyzer.py valida el CSV, agrupa extensiones y genera informes TXT/JSON con rutas candidatas por palabras clave. Es un análisis de índice y nombres de ruta; no decodifica el contenido binario UAsset/UEXP ni demuestra por sí solo la función de cada recurso.

Los grupos de candidatos se solapan y son amplios. No deben interpretarse como cantidades de recursos únicos confirmados. Ejemplos interesantes para análisis posterior:
- CoreAI: Dino_BT, DinoAttack_BT, DinoFlee_BT, DinoSeek_BT y Dino_AIController_BP.
- Domesticación: TameDilo y TameDodo.
- Aparición de criaturas: M_PersistentGameplaySublevel_DinoSpawns.
- Inventario: PrimalItemCostumeGeneric, PrimalItemSkinGeneric y StructureItemContainerBaseBP.
- Suministros: SupplyCrateBaseBP, SupplyCrate_LevelXX y ArtifactCrate_1/2.
- Armas: carpetas ShooterGame/Content/PrimalEarth/Weapon...

## Cambios registrados en GitHub
Repositorio: bladimirhurtado/bladi3ai
- scripts/ark_inventory_analyzer.py — commit d4b1aec21fb1136f40d3c8807b5d9ec6b2e23eb8.
- rea.sh — opción 7 para analizador ARK; commit 60f230edafcad8125d308105dd8fd879e30687db.
- docs/REA-MOVIL.md — documentación; commit 3d28ed2638c7ff0a94f8a177d019deef116b750c.
El usuario hizo git pull y ejecutó la opción 7 correctamente; el informe indicó 34.285 entradas validadas y que no se extrajo ni modificó el PAK.

## Advertencia pendiente
En la ejecución local apareció SyntaxWarning por la cadena "\\.umap" (escape inválido). La versión consultada en GitHub parecía mostrar ".umap" sin barra invertida, pero no se ha confirmado ni corregido la copia local del teléfono. No afirmar que está resuelto.

## Próximo paso técnico — aún no realizado
Inspeccionar el código exacto del parser del índice y confirmar el esquema de offsets, tamaños, método de compresión y hashes de cada entrada. Después, hacer una prueba de lectura de uno o dos recursos pequeños y bien identificados (.uasset/.uexp) mediante acceso aleatorio al PAK dentro del ZIP, sin extraer el PAK completo. No asumir el formato ni las posiciones hasta revisar el parser y validar los datos. Mantener todo en modo solo lectura.

## Límites de lo conseguido
Hasta este punto se verificaron el contenedor ZIP, el footer e integridad SHA-1 del índice y se inventariaron sus 34.285 entradas. Todavía no se han decodificado los paquetes UAsset/UEXP ni reconstruido lógica, comportamiento o mecánicas del juego. Esto es una base de trabajo, no ingeniería inversa completa.
