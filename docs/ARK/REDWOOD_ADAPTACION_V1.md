# REDWOOD 2.0 — Adaptación del bosque existente (V1)

Estado: **diseño de adaptación preparado; todavía no aplicado al juego**.
Objetivo: mejorar el bosque Redwood existente de The Island sin sustituirlo, rehacer el mapa ni alterar el PAK original.

## 1. Base confirmada del proyecto

Assets locales ya extraídos por el usuario:
- `DinoSpawnEntriesRedwoods.uasset` — 2.247 bytes.
- `DinoSpawnEntriesRedwoods.uexp` — 22.045 bytes.
- Informe de cadenas: `inspeccion_redwood.txt` — 93 cadenas.
- El spawner contiene nombres de propiedades como `NPCSpawnEntries`, `NPCSpawnLimits`, `NPCClass`, `EntryWeight`, `NPCsToSpawn`, `NPCsToSpawnPercentageChance` y rangos de nivel.
- Se identificaron rutas/clases de criaturas como Achatina, Ant/FlyingAnt, Bigfoot, Carno, Compy, Dimorphodon, Diplodocus, Direbear, Doedicurus, Gallimimus, Paracer, Ptero, Purlovia, Stag y TerrorBird. Son cadenas encontradas; no tenemos todavía los pesos ni la estructura de cada entrada decodificados.

Evidencia del juego/documentación:
- Redwood es una región del centro-sur de The Island, rodeada por ríos; sus árboles gigantes son parte esencial de su identidad y soportan plataformas arbóreas.
- El bioma se caracteriza por vegetación abundante, árboles Redwood no destruibles, colmenas, madera y fauna de bosque; también presenta peligros de altura y depredadores.
- La documentación de modding de ARK identifica el material de paisaje de The Island como `Mat_TheIslandWithMasks_Inst`, el material de agujeros como `Mat_TheIslandWithMasks_Hole_Inst`, el agua como `BP_IslandWaterPlane` y el plano oceánico como `SM_OceanPlane`. Esto es referencia de modding, no prueba de que esos paquetes estén extraídos en este proyecto.

Fuentes:
- https://ark.wiki.gg/wiki/The_Redwood_Forests
- https://ark.wiki.gg/wiki/Biome
- https://ark.wiki.gg/wiki/Mod:Modding/Landscape

## 2. Diseño de adaptación: cinco subzonas funcionales

No asignar coordenadas inventadas. Estas subzonas son objetivos de diseño que se ubicarán al inspeccionar los assets de nivel y sus transforms.

### A. Núcleo de secuoyas — conservar y enriquecer
- Conservar los árboles gigantes originales y la posibilidad de construir plataformas.
- Añadir variedad de sotobosque compatible con la escala del bosque: helechos, arbustos, raíces expuestas, troncos caídos y vegetación baja.
- Evitar que nuevos elementos tapen los troncos utilizables o bloqueen las zonas de construcción.
- No reemplazar los árboles principales ni reducir su silueta dominante.

### B. Claros naturales — mejorar lectura y navegación
- Crear pequeños claros irregulares, no plazas geométricas.
- Variar el suelo con hojarasca, hierba, rocas pequeñas y troncos.
- Mantener visibilidad suficiente para reconocer fauna y amenazas.
- Evitar abrir claros grandes que hagan perder la sensación de bosque denso.

### C. Corredores de tránsito — resolver el bosque demasiado cerrado
- Definir corredores orgánicos entre claros, bordes del bosque y pasos existentes.
- Mantener el relieve y las rutas originales; limpiar únicamente vegetación secundaria que obstruya el paso.
- No cortar raíces/troncos estructurales ni modificar colisiones sin verificar el objeto responsable.
- Los corredores deben ser navegables a pie y no convertirse en carreteras rectas.

### D. Riberas y humedad — integrar bosque y agua
- Reforzar visualmente la transición bosque-río con vegetación de ribera, piedras, raíces y pequeñas zonas abiertas.
- Mantener libre el volumen de agua y las entradas de cuevas.
- No editar `BP_IslandWaterPlane` ni `SM_OceanPlane` hasta identificar y validar sus assets locales; el plano de agua de The Island puede contener huecos funcionales de cuevas.
- Evitar colocar árboles/rocas que tapen accesos o creen colisiones invisibles.

### E. Laderas y roquedos — dar variedad vertical
- Agrupar rocas y vegetación por pendiente; dejar expuestas algunas paredes y afloramientos.
- Mantener despejados los puntos de escalada y las rutas de fauna.
- No alterar heightmaps ni mallas de colisión sin conocer escala, transforms y referencias del nivel.

## 3. Ajuste ecológico de fauna (fase posterior, usando el spawner existente)

Objetivo: que el bosque se sienta variado sin convertirlo en una zona injustamente saturada.
- Revisar por separado fauna pequeña, herbívoros, depredadores terrestres y amenazas arbóreas.
- Preservar la identidad de las especies ya observadas en las cadenas del spawner.
- No inventar EntryWeight, NPCSpawnLimits, cantidades, porcentajes ni niveles: esos valores deben salir de una decodificación real de las propiedades serializadas.
- La distribución final se decidirá después de recuperar cada entrada, sus pesos, límites y referencias de clase.

## 4. Orden de implementación

1. **Vegetación secundaria y composición de claros**: primera intervención visual, siempre sobre copias y con referencias de transforms.
2. **Corredores y limpieza de obstrucciones**: después de comprobar colisiones y navegación.
3. **Riberas y laderas**: después de localizar los meshes/foliage y sus referencias.
4. **Spawner Redwood**: solo tras decodificar completamente sus propiedades y validar el serializer.
5. **Prueba dentro del juego**: comparar capturas y rendimiento antes/después, revisar colisiones, plataformas arbóreas, navegación y spawn rates.

## 5. Qué se puede ejecutar hoy y qué bloquea el cambio real

Ya está hecho:
- Extracción de los dos archivos del spawner.
- Inspección de cadenas y nombres de propiedades.
- Inventario PAK y clasificación ARK MAP LAB.
- Herramientas de relación, integración y probe de cabecera.

Bloqueos reales:
- No se ha identificado en los archivos compartidos un paquete de Landscape/foliage del Redwood con sus datos completos.
- El probe leyó solo los primeros 20 bytes del .uasset; no decodificó imports/exports ni propiedades.
- No hay un serializador probado con estos assets de ARK móvil.
- No tenemos transforms/coordenadas de los objetos del bosque ni el paquete de nivel que los referencia.

**Conclusión técnica:** con los datos actuales puedo preparar la adaptación y definir sus cambios, pero no escribirlos de forma segura dentro del mapa. Un cambio físico ahora sería inventado o podría corromper el paquete. La primera edición real será la vegetación secundaria/claros cuando se disponga del paquete de nivel/foliage legible y sus referencias; no se vuelve a empezar ni se repite la extracción del PAK.

## 6. Criterios de aceptación de Redwood 2.0

- Los árboles gigantes y las plataformas arbóreas siguen funcionando.
- Hay claros pequeños y orgánicos sin perder densidad visual.
- Los corredores conectan espacios sin parecer caminos artificiales.
- Las riberas se integran sin bloquear agua, cuevas ni navegación.
- No aparecen colisiones invisibles ni objetos flotantes.
- La fauna mantiene el carácter Redwood y sus tasas se verifican en juego.
- El PAK y todos los assets originales mantienen sus hashes.
- Se registra cada asset editado, hash original/nuevo, herramienta/versión y resultado de prueba.
