# ARK Redwood — siguiente fase de trabajo

Este flujo reutiliza los datos que ya están extraídos. No vuelve a abrir ni extraer el PAK.

## Fuentes ya existentes

- Inventario: `~/ark/01_INVENTARIO/original/pakchunk1-Android_lista.txt`
- Biomes: `ark_work/ARK_MAP_LAB/originales/M_PersistentGameplaySublevel_Biomes.uexp`
- DinoSpawns: `ark_work/ARK_MAP_LAB/originales/M_PersistentGameplaySublevel_DinoSpawns.uexp`
- Spawner Redwood extraído: `ARK_MAP_LAB/redwood_spawner/CoreBlueprints/Spawners/DinoSpawnEntriesRedwoods.uasset` y su `.uexp`.

## Construir el informe combinado de candidatos

Desde la raíz de `bladi3ai`, si las carpetas de trabajo están en las rutas registradas:

```bash
python scripts/ark_zone_relation_builder.py \
  --biomes ark_work/ARK_MAP_LAB/originales/M_PersistentGameplaySublevel_Biomes.uexp \
  --spawns ark_work/ARK_MAP_LAB/originales/M_PersistentGameplaySublevel_DinoSpawns.uexp \
  --inventory ~/ark/01_INVENTARIO/original/pakchunk1-Android_lista.txt \
  --out ark_work/zonas_secuoyas/redwood_relaciones
```

El parámetro `--inventory` es importante: sin él, las rutas del inventario quedan en cero aunque el inventario exista. El informe identifica rutas cuyo nombre contiene alias de zona; son candidatos, no referencias UObject demostradas.

Después se puede reutilizar el integrador existente:

```bash
python scripts/ark_ecosystem_integrator.py \
  --map-summary ~/ark/analisis/mapa/mapa_resumen.json \
  --zone-report ark_work/zonas_secuoyas/redwood_relaciones.json \
  --out ark_work/zonas_secuoyas/ark_ecosystem
```

No ejecutar estos comandos automáticamente si sus salidas ya están actualizadas respecto a los hashes de entrada. Comparar hashes y fechas primero.

## Mejora incorporada en esta fase

- Zone Relation Builder actualizado a 0.2.0.
- Ayuda CLI deja claro que el inventario es el TXT PAK existente.
- Prueba automatizada nueva: el builder recibe inventario, identifica las dos rutas Redwood conocidas (spawner y WoodHarvestComponent_RedWood), deja fuera el spawner Swamp, registra SHA-256 del inventario y confirma que el archivo no cambia.
- No se escribe ningún asset ni se modifica el PAK.

## Qué demuestra y qué no

Demuestra que podemos cruzar nombres/rutas del inventario con cadenas de zona y registrar evidencia reproducible. No demuestra que un spawner esté conectado a un sublevel por imports/exports, ni que los pesos o límites de aparición se hayan interpretado.

## Próxima fase técnica

Construir un lector de cabecera/summary de paquetes Unreal, de solo lectura, para los archivos Redwood ya extraídos. Primero identificar package version, licensee version, custom versions, flags, offsets de name/import/export tables y si el paquete usa unversioned properties. No escribir ni reserializar archivos. Validar el lector con pruebas sintéticas y hashes antes/después.
