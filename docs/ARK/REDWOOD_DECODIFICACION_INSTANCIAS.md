# Redwood — descodificación de instancias y referencias

Estado: herramienta de inspección creada; falta ejecutarla sobre los binarios locales del usuario.

## Herramienta elegida

Se añade `scripts/ark_redwood_instance_decoder.py` (commit `c5ad52f385a492981626b84bad6b60a89d64bff6`).

Usa `uasset_read` como lector de paquetes UE, en vez de volver a crear un parser desde cero. El lector puede producir tablas de nombres, imports, exports, relaciones y propiedades/transform cuando el formato del paquete está soportado. La herramienta:
- consume el inventario PAK existente y filtra rutas candidatas por nombres Redwood/foliage/instanced/landscape/tree;
- inspecciona paquetes .uasset/.umap ya extraídos;
- conserva nombre, clase, outer/class/template refs, estado de parseo, propiedades y diagnósticos;
- busca claves relacionadas con transform, location, rotation, scale e instancias;
- escribe JSON de informe y nunca escribe en los assets fuente.

Repositorio del parser: https://github.com/soatori/uasset_read
Documentación de su API y límites: https://github.com/soatori/uasset_read

## Compatibilidad: punto crítico

El encabezado Redwood ya observado tenía:
- package tag reconocido `0x9E2A83C1`;
- legacy file version `-7`;
- FileVersionUE4 `0`;
- LicenseeVersionUE4 `0`.

Esto no determina por sí solo la versión exacta del motor ni demuestra el formato de propiedades. El proyecto `uasset_read` declara que su ruta de propiedades unversioned cooked/Zen está fuera del soporte actual; los mappings `.usmap` descritos para editor no equivalen automáticamente a soporte del build móvil de ARK.

Por eso la primera ejecución es una prueba de compatibilidad, no una promesa de que ya recuperará transforms. Si el paquete queda opaco o falla por versión/unversioned, conservar el diagnóstico y pasar a un lector UE con soporte de mappings/versiones de ARK; no adivinar offsets.

## Ejecución en Termux

No repetir extracción del PAK ni regenerar inventario. Desde Termux:

```bash
python -m pip install --upgrade "git+https://github.com/soatori/uasset_read.git"
python ~/bladi3ai/scripts/ark_redwood_instance_decoder.py \
  --inventory ~/ark/01_INVENTARIO/original/pakchunk1-Android_lista.txt \
  --root ~/ark/ARK_MAP_LAB \
  --package ~/ark/ARK_MAP_LAB/redwood_spawner/CoreBlueprints/Spawners/DinoSpawnEntriesRedwoods.uasset \
  --out ~/ark/ARK_MAP_LAB/REDWOOD-instancias-diagnostico.json
```

Este primer pase revisa el spawner ya extraído y lista candidatos del inventario. El directorio `ARK_MAP_LAB` se recorre para incluir otros paquetes que ya estén extraídos allí. Si la salida dice que faltan clases de foliage/instancing, significa que aún no se ha extraído el paquete correcto, no que el bosque carezca de instancias.

## Qué buscar en el resultado

Prioridad de clases:
- `InstancedFoliageActor`
- `FoliageInstancedStaticMeshComponent`
- `HierarchicalInstancedStaticMeshComponent`
- `InstancedStaticMeshComponent`
- `Landscape` / `LandscapeComponent`
- `StaticMeshComponent` asociado a árboles/arbustos

Prioridad de datos:
- refs a StaticMesh/foliage type;
- `FTransform`, translation/location, rotation, scale;
- arrays de instancias y sus transforms;
- outer refs que permitan llegar al actor/level;
- serial offsets/tamaños para validar dónde vive cada export.

## Siguiente paso después del diagnóstico

1. Revisar el JSON de diagnóstico, no volver a clasificar el inventario.
2. Elegir del inventario solo los paquetes que contengan las clases o nombres de foliage/instancing encontrados.
3. Extraer esos pocos pares .uasset/.uexp (y .ubulk si aparece) con el extractor PAK ya existente.
4. Ejecutar el decoder sobre esos paquetes.
5. Si las propiedades están disponibles, reconstruir tabla de instancias con asset mesh, referencia, transform y nivel/outer.
6. Solo entonces diseñar y aplicar cambios a copias, con hashes antes/después y validación del juego.

## Regla de evidencia

- nombre/ruta coincidente = candidato;
- import/export resuelto = referencia estructural;
- propiedad transform decodificada y validada = posición/escala/rotación;
- instancia vinculada a un actor/level mediante referencias comprobadas = instancia ubicada en el mapa.

No llamar “posición del mapa” a una cadena suelta ni a un transform local sin resolver su cadena de padres.
