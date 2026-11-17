# ARK — Estado maestro único del proyecto

Última revisión: 2026-11-16
Repositorio: `bladimirhurtado/bladi3ai`
Rama de trabajo: `ark/zone-relations-redwood-prototype`
Último commit confirmado por el usuario en Termux: `0826c53` (sincronizado el 2026-11-16).

> Este documento es la fuente única de verdad operativa para continuar el trabajo ARK entre chats. Antes de pedir al usuario un comando, consultar este registro y el repositorio. No repetir tareas marcadas como completadas salvo que exista una razón técnica concreta y se explique.

## 1. Reglas obligatorias para continuar

1. No volver a extraer el PAK ni reconstruir sus fragmentos: ya está extraído.
2. No volver a generar el inventario PAK de 23.609 recursos ni el informe ARK MAP LAB, salvo que cambie el PAK de origen.
3. No volver a ejecutar análisis ya terminados solo para “comprobar”: reutilizar los JSON/TXT/CSV existentes.
4. No pedir al usuario que copie scripts que ya están en el repositorio. Consultar GitHub o el archivo maestro primero.
5. Separar claramente: **hecho y verificado**, **candidato**, **pendiente de probar** y **no compatible**.
6. Mantener el PAK y los assets originales intactos. Todo experimento se hace sobre copias y en modo lectura hasta que un parser demuestre lectura correcta.
7. No crear otro extractor/analizador con la misma función. Extender o conectar herramientas existentes.
8. Cada avance debe actualizar este documento con fecha, commit, evidencia y siguiente paso único.

## 2. Entorno y datos ya conocidos

### Equipo y entorno
- Trabajo local más reciente: Android/Termux, Android 15, arquitectura aarch64.
- Python disponible; el usuario ha usado Python 3.14.8.
- No asumir que .NET, FModel, CUE4Parse o UAssetAPI estén instalados en Termux.
- En el entorno inicial de análisis se comprobó que no estaban disponibles UnrealPak, repak, u4pak, umodel ni FModel. Esta comprobación fue anterior; no asumir instalaciones posteriores sin evidencia.

### PAK original
- Archivo: `~/ark/pakchunk1-Android.pak`
- Tamaño: 460.468.964 bytes.
- SHA-256: `86b61fd266a67fd30be4717bb9581ee83b469cc9fcb13d8fd9f6bd83b24e07bd`
- Firma PAK observada en offset: 460.468.920.
- PAK version reportada por `pak_v4.py`: 4.
- Índice: offset 457.255.289; tamaño 3.213.630 bytes.
- SHA1 del índice: correcto.
- Índice cifrado: 0.
- Esto confirma el formato de índice PAK detectado, **no** la versión exacta de Unreal Engine usada para cocinar los assets.

### Inventario e informes ya generados
- Inventario original: `~/ark/01_INVENTARIO/original/pakchunk1-Android_lista.txt`
- CSV inventario: `~/ark/01_INVENTARIO/original/ARK-inventario.csv`
- Entradas validadas: 23.609.
- ARK MAP LAB resumen: `~/ark/analisis/mapa/mapa_resumen.json`
- También existe resumen: `~/ark/02_MAPAS_NIVELES/candidatos/mapa_resumen.json` (no asumir que es idéntico; comparar hashes si ambos se van a usar).
- Informe ARK MAP LAB anterior: 126 candidatos. Informe usado por el integrador más reciente: 1.738 candidatos. No comparar como si fueran la misma métrica sin verificar qué informe/versión generó cada cifra.
- Informe de zonas: `~/bladi3ai/ark_work/zonas_secuoyas/redwood_relaciones.json`
- Informe integrado: `~/bladi3ai/ark_work/zonas_secuoyas/ark_ecosystem.json`
- Salida del integrador: 23.611 recursos únicos, 1.738 candidatos nombrados, 6 zonas con candidatos.
- El informe integrado indica que el constructor no recibió inventario: `zone_builder_has_inventory_source=false`; por eso las rutas candidatas de inventario aparecen en cero. No es ausencia de inventario: es una fuente que no se pasó al constructor.

### Assets ya extraídos / inspeccionados
- Biomes y DinoSpawns:
  `ark_work/ARK_MAP_LAB/originales/M_PersistentGameplaySublevel_Biomes.umap/.uexp`
  `ark_work/ARK_MAP_LAB/originales/M_PersistentGameplaySublevel_DinoSpawns.umap/.uexp`
- Copias de trabajo también existen en `ark_work/zonas_secuoyas/`.
- Spawner Redwood extraído desde el PAK:
  `ARK_MAP_LAB/redwood_spawner/CoreBlueprints/Spawners/DinoSpawnEntriesRedwoods.uasset`
  `ARK_MAP_LAB/redwood_spawner/CoreBlueprints/Spawners/DinoSpawnEntriesRedwoods.uexp`
- Inspección de cadenas: `ARK_MAP_LAB/redwood_spawner/CoreBlueprints/Spawners/inspeccion_redwood.txt`
- Se encontraron 93 cadenas. Entre las propiedades figuran `NPCSpawnEntries`, `NPCSpawnLimits`, `NPCClass`, `EntryWeight`, `NPCsToSpawn`, `NPCsToSpawnPercentageChance`, `NPCDifficultyLevelRanges`, etc.
- Nombres de criaturas observados incluyen Achatina, Ant, FlyingAnt, Bigfoot, Carno, Compy, Dimorphodon, Diplodocus, Direbear, Doedicurus, Gallimimus, Paracer, Ptero, Purlovia, Stag y TerrorBird. Esto es evidencia de cadenas/rutas, no aún una reconstrucción validada de los pesos y relaciones serializadas.

## 3. Herramientas propias existentes — no duplicar

| Herramienta | Ubicación conocida | Estado / responsabilidad |
|---|---|---|
| `pak_v4.py` | `~/ark/pak_v4.py`, `~/ark/00_HERRAMIENTAS/scripts/pak_v4.py` | PAK v4: valida índice y extrae entradas seleccionadas. Dos copias tuvieron SHA256 idéntico: `34a7e8f1e0a52da54272e7fa9eedfe4685ad9f62dae3a4b925be0d2de9676bf5`. |
| `ark_map_lab.py` | `~/ark/ark_map_lab.py`, `~/ark/00_HERRAMIENTAS/scripts/ark_map_lab.py` | Clasifica rutas del inventario por categorías. Copias verificadas con SHA256 `9bb1e9999f5a632237013f1ae4667ee2ec3c501fca08fc95dce8be9078fb99b8`. |
| `ark_inventory_analyzer.py` | ubicación bajo `00_HERRAMIENTAS` en el entorno ARK | Cruza inventario con informe de componentes. CLI ya inspeccionada. |
| `inspeccionar_pak.py` | `~/ark/ark_work/inspeccionar_pak.py` | Herramienta de inspección PAK existente. |
| `ark_zone_relation_builder.py` | `scripts/ark_zone_relation_builder.py` | Extrae cadenas ASCII/UTF-16LE y crea candidatos por alias de zona; no decodifica imports/exports ni propiedades completas. v0.1.1. |
| `ark_ecosystem_integrator.py` | `scripts/ark_ecosystem_integrator.py` | Combina informes JSON existentes; no añade por sí mismo relaciones verificadas. v0.1.0. |

### Pruebas conocidas
- Zone Relation Builder: 5 pruebas locales pasaron en Termux.
- Ecosystem Integrator: 2 pruebas nuevas + 5 pruebas anteriores, 7/7 en GitHub Actions según consulta de ejecución.
- Commit `bf430d8b7d4bfd6ba9397d334440d426bf7ff702` fue la revisión asociada a la actualización que el usuario hizo fast-forward en Termux.
- Después del pull, el usuario ejecutó el integrador y generó `ark_ecosystem.json`.

## 4. Compatibilidad de herramientas externas — revisión 2026-11-16

La compatibilidad tiene tres capas distintas: (a) formato PAK, (b) formato/versión de los paquetes .uasset/.uexp/.umap y (c) sistema operativo/runtime donde se ejecuta la herramienta. No confundirlas.

### FModel
- Uso: explorador GUI de archivos/archivos Unreal, apoyado en CUE4Parse.
- Plataforma documentada por la guía de instalación consultada: Windows x64; requiere .NET 10 actual y recomienda hasta 2 GB de RAM según el juego.
- Veredicto para Termux Android: **no compatible como aplicación nativa soportada**. No invertir tiempo intentando instalar su GUI en el teléfono.
- Posible uso: PC Windows x64, si está disponible, como interfaz de inspección. Aun allí, la compatibilidad con este ARK móvil concreto no está confirmada.
- La lista pública FModel/Game-Compatibility se declara incompleta y contiene juegos verificados; no se encontró confirmación específica de este ARK móvil en la evidencia consultada.

### CUE4Parse
- Uso: biblioteca .NET para leer archivos de archivos Unreal y paquetes, cargar objetos y exportar datos.
- Paquete NuGet consultado: destino incluido net10.0; NuGet calcula compatibilidad para net10.0-android, pero eso **no equivale a una prueba de ejecución en Termux/Android ni garantiza dependencias nativas**.
- Veredicto: **candidato técnicamente más prometedor para un lector automatizado**, pero compatibilidad con este PAK/los assets ARK sigue sin probarse.
- No asumir UE4.27. El ejemplo de documentación usa UE4.27, pero no identifica nuestro juego.
- Prueba futura controlada: cargar primero un asset pequeño ya extraído, de solo lectura; registrar engine version, custom versions, imports/exports, mappings y errores. Después intentar el spawner Redwood.

### UAssetAPI / UAssetGUI
- Uso: biblioteca .NET para lectura/escritura de .uasset; la documentación declara un rango amplio aproximado UE4.13 a UE5.7 y soporte para muchas propiedades, JSON, bytecode y .usmap.
- UAssetGUI es interfaz gráfica de escritorio.
- Veredicto: **candidato para inspección y eventual serialización**, pero no se ha probado con los assets ARK de este proyecto. La amplitud de versiones declarada no garantiza que todos los formatos cocinados, custom versions o propiedades de ARK móvil estén soportados.
- No usar para escribir/modificar todavía. Primero validar lectura y binary equality en copias.

### Resumen de compatibilidad
| Herramienta | Termux Android | PC Windows x64 | ARK de este proyecto |
|---|---|---|---|
| FModel GUI | No soportado/documentado | Sí, plataforma documentada | No verificado |
| CUE4Parse | NuGet anuncia TFM Android calculado; runtime/dependencias no probados | Sí, .NET | No verificado; primer candidato a prueba |
| UAssetAPI | Runtime Android no probado | Sí, .NET | No verificado; candidato posterior |
| UAssetGUI | GUI de escritorio; no asumir Android | Sí | Depende de UAssetAPI y de los assets |
| `pak_v4.py` propio | Sí, ya ejecutado en Termux | No evaluado aquí | PAK v4 probado para índice/extracción, no parseo completo de paquetes UE |

## 5. Lo que falta saber antes de afirmar compatibilidad real

1. Versión exacta de Unreal Engine y custom versions de los assets. El número PAK 4 **no** la determina.
2. Si los .uasset/.uexp extraídos usan propiedades etiquetadas o unversioned y si requieren mappings (.usmap/.jmap).
3. Si el paquete de CUE4Parse puede ejecutar en el Android/Termux disponible; no se ha demostrado que .NET esté instalado.
4. Si CUE4Parse o UAssetAPI pueden leer el spawner Redwood y mantener una representación fiel.
5. Si el juego móvil utiliza modificaciones de motor/serialización que requieran configuración específica.

## 6. Siguiente paso único — no repetir inventario ni extracción

Construir una prueba de lectura **sobre las copias ya extraídas**, no sobre el PAK original:
- Primero identificar en el header de un .uasset ya extraído las versiones de paquete/object/custom versions con una herramienta de inspección que ya exista o un pequeño lector de cabecera estrictamente de solo lectura.
- Después usar esos datos para fijar el perfil CUE4Parse/UAssetAPI.
- Probar un solo asset pequeño y después `DinoSpawnEntriesRedwoods.uasset + .uexp`.
- Comparar SHA256 antes/después y no escribir nunca sobre el origen.
- Si el entorno Android no soporta el runtime .NET requerido, trasladar solo esta fase de parser a PC Windows; mantener inventario y scripts Python existentes en Termux.

No pedir de nuevo al usuario el inventario, las rutas ya listadas, ni los resultados de la extracción.

## 7. Registro de decisiones
- Decisión del usuario: reparar, mejorar y evolucionar el ecosistema ARK existente; no reinventar herramientas aprovechables.
- Prioridad: dejar de repetir trabajo entre chats. Consultar este archivo primero y actualizarlo tras cada avance.
- El usuario quiere que el asistente organice el proyecto y avance sin pedirle comandos redundantes.
- No afirmar que una herramienta es compatible con ARK hasta probarla con los archivos reales.


## 8. Avance incorporado — 2026-11-16

- Se reutilizó el Zone Relationship Builder existente; no se creó un segundo analizador.
- Versión actual del builder: **0.2.0**. El parámetro `--inventory` ya existía en el CLI, pero la ejecución anterior no lo recibió; eso explica los ceros en `inventory_path_candidates`. Se aclaró su ayuda para indicar que debe recibir el TXT de inventario PAK ya generado.
- Se añadió una prueba automatizada que pasa el inventario existente y exige detectar dos rutas Redwood conocidas (Spawner Redwood y WoodHarvestComponent_RedWood), excluir la ruta Swamp, registrar SHA-256 y comprobar que el inventario no se modifica.
- Se creó `docs/ARK/REDWOOD_PIPELINE.md` con el flujo exacto para reutilizar inventario, Biomes, DinoSpawns y el integrador, sin reextraer el PAK.
- Commits nuevos en esta rama: `07f0385` (versión/ayuda), `caa2c3d` (prueba de inventario), `fa894ff` (documentación de flujo).
- PR existente: [#38](https://github.com/bladimirhurtado/bladi3ai/pull/38). No se abrió un PR duplicado. La actualización de esta fase queda en esa misma rama/PR.
- Validación: la prueba local nueva aún no se ha ejecutado en Termux; GitHub Actions no devolvió una ejecución asociada a estos commits mediante la consulta disponible. **No declarar CI verde todavía.**

### Siguiente acción
Ejecutar las pruebas del workflow sobre el nuevo commit y, en paralelo, avanzar al lector de cabecera Unreal de solo lectura sobre el spawner Redwood extraído. No repetir inventario ni extracción.

## 9. Nuevo trabajo técnico — lector preliminar de cabecera Unreal

- Se añadió `scripts/ark_unreal_header_probe.py` (v0.1.0): lectura de los primeros 20 bytes, validación del tag de paquete Unreal y extracción de los cuatro enteros iniciales del prefijo, junto con tamaño y SHA-256.
- Se añadieron tres pruebas sintéticas: prefijo válido y fuente intacta, tag incorrecto y archivo truncado.
- Se documentó la invocación sobre el spawner Redwood ya extraído en `docs/ARK/REDWOOD_PIPELINE.md`.
- Límite explícito: no interpreta el FPackageFileSummary completo, custom versions, imports/exports, mappings ni propiedades. No deducir todavía versión exacta del motor ni compatibilidad de CUE4Parse a partir de esta herramienta.
- Commits de esta fase: `5fcf564`, `a1e3a01`, `d44667b`, `5c0975d`, `03c9d4d`, `42e738f`, `80dce47`, `46de45c`.
- Pruebas reales del nuevo lector: pendientes de ejecución en CI/Termux. No marcar como validadas hasta observar el resultado.

### Próximo paso único
Sincronizar esta rama y ejecutar una sola vez el probe contra el `.uasset` Redwood ya extraído. Compartir el JSON de salida; con esos valores se decide si ampliar el lector de summary o pasar directamente a un parser compatible. No reextraer el PAK ni rehacer el inventario.


## 10. Resultado real del probe Redwood — 2026-11-16

El usuario ejecutó `scripts/ark_unreal_header_probe.py` sobre el asset ya extraído:
- Archivo: `~/ark/ARK_MAP_LAB/redwood_spawner/CoreBlueprints/Spawners/DinoSpawnEntriesRedwoods.uasset`
- Tamaño: 2.247 bytes.
- SHA-256: `c019ca14e75b2ef0adeb0f708b0ea24fea366fdcf1ff56fa81e7cba352e4bf47`.
- Package tag: `0x9E2A83C1`, reconocido.
- Legacy file version: -7; legacy UE3: 0; UE4 file version: 0; licensee version: 0.
- Alcance: únicamente prefijo fijo de 20 bytes. **No** se ha leído FPackageFileSummary completo, custom versions, imports, exports ni propiedades. No concluir versión exacta del motor ni modo unversioned solo con esos cuatro enteros.
- No se ha modificado el asset.

## 11. Inicio de fase de terreno — prioridad actual

El usuario decidió pasar a mejoras del terreno. Reutilizar la investigación The Island ya hecha:
- Inventario existente: `~/ark/01_INVENTARIO/original/pakchunk1-Android_lista.txt`; no regenerarlo.
- ARK MAP LAB ya clasificó recursos y produjo 82 candidatos en categoría `terreno` según el resumen previamente comunicado. Extraer esos registros del informe existente; no volver a ejecutar la clasificación.
- `M_PersistentGameplaySublevel_Biomes.umap` (14.972 bytes) y `M_PersistentGameplaySublevel_DinoSpawns.umap` (316.989 bytes) están identificados como subniveles funcionales, no como parcelas de geometría del terreno.
- En la búsqueda anterior no se encontró `TheIsland.umap` ni se confirmó un paquete principal con Landscape/heightmap. No afirmar que se dispone de la geometría editable.
- También se inspeccionó `DayCycleManager_TheIsland.uasset/.uexp`; propiedades relacionadas con hora, temperatura, iluminación, viento y sonidos aparecen en cadenas, pero los valores no están mapeados con certeza. No es un archivo de terreno.
- Plan por zonas aprobado conceptualmente: relieve/landscape, biomas, agua, vegetación, geología/rocas/recursos, cuevas, fauna y POI; cada relación debe etiquetarse como confirmada, candidata o desconocida.
- Próximo paso concreto: recuperar del informe ya existente la lista exacta de los 82 candidatos `terreno`, agrupar por extensión y nombre (Landscape, heightmap, terrain, static mesh, rock/cliff, spline, layer, foliage), y priorizar los archivos que sean geometría/altura real. Solo después decidir qué se puede modificar.
- Restricción: no tocar PAK ni assets originales; no inventar coordenadas ni afirmar que se puede editar el mapa hasta identificar y leer un paquete de geometría compatible.



## 12. Corrección de prioridad y trabajo REDWOOD 2.0 — 2026-11-16

El usuario corrigió explícitamente el rumbo: **no trabajar ahora en mejoras generales de The Island**. La tarea activa es mejorar el bosque Redwood que ya se estaba investigando. No volver a abrir la fase genérica de terreno ni pedir comandos para repetir inventario/extracción.

### Adaptación definida
Se creó `docs/ARK/REDWOOD_ADAPTACION_V1.md` en el commit `601f6cf341224eccb31413684c6dcb5e70c695fd`.
Define cinco intervenciones para el Redwood existente:
1. Núcleo de secuoyas: conservar árboles gigantes y plataformas; enriquecer sotobosque.
2. Claros pequeños y orgánicos: mejorar visibilidad sin abrir plazas artificiales.
3. Corredores naturales: mejorar tránsito sin cortar árboles estructurales ni alterar colisiones a ciegas.
4. Riberas: reforzar vegetación/rocas de transición, preservar agua y accesos a cuevas.
5. Laderas/roquedos: dar variedad vertical sin tocar heightmaps/colisiones sin referencias.

La fase posterior de fauna reutilizará el spawner Redwood extraído. No inventar pesos ni límites porque las 93 cadenas encontradas no reconstruyen las propiedades serializadas.

### Estado honesto
- **Hecho en repositorio:** especificación concreta de adaptación Redwood V1, commit `601f6cf`.
- **No hecho todavía en el juego:** no se han modificado árboles, foliage, Landscape, transforms ni spawns del mapa.
- **Bloqueo:** solo se ha inspeccionado el spawner (cadenas) y un prefijo fijo de 20 bytes; faltan paquete de nivel/foliage y referencias espaciales legibles, además de un serializador probado con este ARK móvil.
- No se puede afirmar que el cambio visual esté aplicado solo por haber escrito la especificación. La escritura binaria sin parser/serializer compatible arriesga corromper el mapa.

### Próximo paso único
Conseguir/inspeccionar el paquete de nivel o foliage que contiene las instancias Redwood y sus transforms, reutilizando los archivos ya extraídos y el inventario existente. No repetir extracción completa del PAK ni clasificación ARK MAP LAB. Solo tras identificar esas referencias se hará la primera edición física sobre una copia.


## 13. Decodificación de foliage/instancias Redwood — 2026-11-16

El usuario pidió emplear herramientas de análisis para descodificar instancias de vegetación, posiciones y referencias dentro del mapa. Se añadió una herramienta de inspección reutilizando un parser UE existente, no otro analizador por cadenas:

- Script: `scripts/ark_redwood_instance_decoder.py`
- Commit del script: `c5ad52f385a492981626b84bad6b60a89d64bff6`
- Guía de ejecución/compatibilidad: `docs/ARK/REDWOOD_DECODIFICACION_INSTANCIAS.md`
- Commit de la guía: `dae88f25b2fc309dd2dc73256de2cad2bbb22989`
- Parser elegido: `soatori/uasset_read`, Python sin dependencias de ejecución; API `parse_package_document(..., depth="decode")`. Puede exponer package summary, name/import/export tables, relaciones y propiedades cuando el build/formato es compatible.

### Límite detectado antes de prometer resultados
El spawner Redwood inspeccionado anteriormente tiene legacy version -7, FileVersionUE4=0 y licensee=0. Eso no determina la versión exacta ni demuestra por sí solo la codificación de propiedades. La documentación actual de uasset_read advierte que cooked/Zen unversioned properties quedan fuera del soporte del proyecto. Por tanto el script es un **compatibility probe + inspector**, no evidencia de que ya se han descodificado transforms.

### Estado de ejecución
- Herramienta y flujo guardados en GitHub.
- **No ejecutado todavía sobre los archivos privados/locales de Termux**: el conector GitHub no tiene acceso a `~/ark/...`; solo el usuario puede ejecutar el comando local o adjuntar los binarios. No afirmar que se conocen ya posiciones.
- Primer pase previsto sobre inventario existente y los assets ya extraídos bajo `~/ark/ARK_MAP_LAB`; no repetir extracción ni ARK MAP LAB.
- Salida prevista: `REDWOOD-instancias-diagnostico.json`.
- Si se confirma soporte, seguir con extracción selectiva de los pocos paquetes foliage candidatos; si falla por unversioned/version, usar el diagnóstico para elegir lector UE/mappings compatibles.

### Próximo paso operativo
Ejecutar literalmente los comandos de `docs/ARK/REDWOOD_DECODIFICACION_INSTANCIAS.md` en Termux. Compartir solo el JSON de diagnóstico o su resumen; no hace falta volver a enviar el inventario completo ni el spawner ya inspeccionado.
