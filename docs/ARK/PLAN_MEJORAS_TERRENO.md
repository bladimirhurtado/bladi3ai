# ARK — Plan de mejoras del terreno (The Island)

Estado: fase de identificación de geometría. No se han editado assets de terreno.

## Datos ya disponibles (no repetir)
- PAK Android ya extraído e inventariado: `~/ark/pakchunk1-Android.pak` y `~/ark/01_INVENTARIO/original/pakchunk1-Android_lista.txt`.
- ARK MAP LAB ya clasificó el inventario. El resumen comunicado registra 82 candidatos de categoría `terreno`.
- Informes ya existentes: `~/ark/analisis/mapa/mapa_candidatos.csv`, `~/ark/analisis/mapa/candidatos_mapa.txt`, `~/ark/analisis/mapa/mapa_resumen.json`.
- Subniveles identificados: `M_PersistentGameplaySublevel_Biomes.umap/.uexp` y `M_PersistentGameplaySublevel_DinoSpawns.umap/.uexp`. Son capas funcionales; no están demostrados como geometría Landscape.
- `DayCycleManager_TheIsland.uasset/.uexp` se investigó por separado; sus cadenas indican propiedades ambientales, pero los valores no están asociados con certeza.
- La búsqueda anterior del inventario no encontró `TheIsland.umap`. La ausencia en ese inventario no demuestra que el mundo no exista en otro paquete; sí impide dar por localizado el mapa editable.

## Cómo se organizará el terreno
1. **Geometría y relieve:** Landscape, heightmap, terrain, collision, meshes de terreno.
2. **Formaciones:** montañas, acantilados, rocas, cuevas y entradas.
3. **Hidrología:** océano, ríos, lagos, costas, cascadas.
4. **Cobertura:** árboles, follaje, hierba y capas de paisaje.
5. **Capas de juego:** biomas, spawns, recursos y POI.

Cada elemento se marcará como:
- **Confirmado:** archivo y estructura interna identificados.
- **Candidato:** coincidencia por nombre/ruta o cadenas.
- **Desconocido:** no hay evidencia suficiente.

## Primera tarea (reutilizar los informes, no rehacer análisis)

Extraer únicamente la sección TERRENO del TXT ya generado:

```bash
awk '/===== TERRENO =====/{show=1; next} /^===== /{if(show) exit} show' \
  ~/ark/analisis/mapa/candidatos_mapa.txt
```

Este comando no analiza ni modifica el PAK; solo muestra los candidatos que ARK MAP LAB ya clasificó. Con esa lista se separarán los paquetes de geometría real de los meshes decorativos y nombres genéricos.

## Criterio para comenzar una modificación
No editar hasta identificar:
- paquete fuente y pareja `.uexp`/`.ubulk` si existen;
- tipo de objeto (Landscape, StaticMesh, spline, layer, etc.);
- referencias/imports/exports que lo conectan al nivel;
- coordenadas/transformaciones o datos de altura;
- método de serialización compatible y validado con este build de ARK.

Las pruebas se harán sobre copias y con hash antes/después. Nunca escribir sobre el PAK original.

## Siguiente decisión técnica
Si los 82 candidatos no incluyen geometría Landscape/heightmap, ampliar la búsqueda de nombres dentro del inventario existente y examinar subniveles/paquetes de mapa ya presentes. No reconstruir el inventario ni volver a ejecutar ARK MAP LAB.

## Reglas técnicas de Landscape (referencia de Unreal; no asumir que el asset ARK ya está identificado)

- Unreal documenta heightmaps de Landscape en escala de grises de 16 bits (PNG o R16), además de RAW con metadatos de dimensiones. Fuente: [Landscape heightmap import/export](https://dev.epicgames.com/documentation/unreal-engine/importing-and-exporting-landscape-heightmaps-in-unreal-engine).
- Las dimensiones válidas dependen del tamaño de sección, subsecciones y número de componentes; los bordes entre componentes comparten vértices. Fuente: [Landscape Technical Guide](https://dev.epicgames.com/documentation/unreal-engine/landscape-technical-guide-in-unreal-engine).
- Por tanto, no generar un heightmap sustituto ni fijar resolución/escala a ciegas. Primero hay que identificar la resolución real, escala, ubicación, orientación, capas de peso y referencias del Landscape original.
- Esta documentación describe Unreal en general; no prueba por sí sola que el build de ARK móvil use el mismo esquema sin modificaciones.
