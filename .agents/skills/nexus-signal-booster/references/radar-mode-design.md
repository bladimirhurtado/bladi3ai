# Modo Radar — diseño práctico y plan B

## Objetivo
Dar al usuario una vista tipo radar que ayude a encontrar dónde y cuándo el TCL 605 consigue una conexión móvil más útil y estable. El radar es una interfaz de diagnóstico y orientación: no es un transmisor, repetidor ni amplificador de radio.

## MVP: lo más rápido que puede aportar valor
Construir primero un flujo de campo de baja complejidad, sin esperar a desarrollar una app completa:

1. **Indicador central de estado** con cuatro estados comprensibles: Sin datos, Débil/inestable, Conectado pero lento, Conexión aparentemente estable.
2. **Lecturas que Android permita obtener**: tecnología de red, nivel de señal si está expuesto, operador y datos de servicio. Mostrar “no disponible” cuando el dispositivo/API no entregue un dato; no inventarlo.
3. **Radar visual de lugares**: registrar manualmente hasta cuatro puntos (por ejemplo, junto a una ventana, sala, balcón y exterior seguro). En cada punto, ejecutar la misma prueba corta y guardar hora, barras/nivel disponible, carga de dos páginas, latencia si se puede medir y resultado.
4. **Comparación de estabilidad**: contar fallos y mostrar mediana de latencia cuando existan varias muestras; no elegir el punto solo por las barras ni por el mejor resultado aislado.
5. **Recomendación concreta**: “Repite en el punto B; tuvo menos fallos en las pruebas registradas”, junto con nivel de confianza y fecha.
6. **Modo ARK**: si dos servicios web funcionan pero ARK falla, marcar “probable problema específico de ARK/autenticación/ruta”, no “mala señal”.
7. **Historial local y exportación** para que la herramienta sea útil durante cortes de Internet.

## Diseño visual
- Una pantalla única y sencilla, con un círculo tipo radar, barrido animado discreto y puntos que representen lugares probados.
- El color/animación comunica el estado, pero siempre acompañado de texto accesible y datos reales.
- Sin mapas en línea obligatorios; la primera versión puede usar nombres manuales de puntos y funcionar offline.
- Evitar GPS como supuesto sensor de señal. La ubicación GPS solo sería opcional para etiquetar una prueba y puede consumir batería; la orientación del teléfono no garantiza una mejor recepción.
- No mostrar porcentajes de “potencia mejorada” ni simulaciones que parezcan mediciones reales.

## Experimento mínimo para comprobar utilidad
En dos o tres ubicaciones seguras:
1. Mantener el mismo teléfono, SIM, configuración y prueba.
2. Ejecutar dos comprobaciones web ligeras por ubicación.
3. Repetir al menos tres veces por punto, si las condiciones lo permiten.
4. Registrar hora, resultado de cada servicio y latencia/pérdida solo si la herramienta puede medirlas correctamente.
5. Recomendar un punto solo si la ventaja se repite; si las mediciones cambian mucho, declarar resultado inconcluso.

No hace falta esperar a que falle ARK para comenzar el mapa de puntos. No cambiar APN, DNS, VPN ni tipo de red durante este primer experimento: primero establecer una línea base.

## Plan B por limitación
- **Android no expone métricas celulares:** radar manual por ubicaciones, resultados web y estabilidad observada; se etiqueta la señal radioeléctrica como “no medida”.
- **No hay Internet durante la prueba:** guardar datos locales y comparar solo lo que se pueda medir; verificar servicios remotos cuando vuelva la conexión.
- **La señal parece buena pero los datos fallan:** investigar congestión, servicio del operador, SIM/APN o ruta; una antena podría no ayudar.
- **Internet funciona y solo falla ARK:** cambiar a diagnóstico de ARK/Google Play Games, sin perseguir barras de señal.
- **La mejor ubicación no mejora suficientemente:** revisar bandas/operador y valorar hotspot LTE externo desbloqueado con bandas confirmadas y conectores de antena reales. No comprar antes de verificar la variante exacta.
- **Una app propia tarda demasiado o exige permisos excesivos:** mantener el protocolo manual y crear la app solo si se demuestra que automatizar ahorra tiempo o mejora la decisión.

## Límites y seguridad
Una aplicación Android normal no puede aumentar la potencia del módem, seleccionar cualquier banda a voluntad ni crear cobertura física. No usar root, firmware modificado ni repetidores celulares improvisados. Cualquier hardware futuro debe ser compatible con las bandas locales y con la normativa aplicable.

## Criterio de éxito
El modo Radar será útil si ayuda a identificar de forma repetible un punto/condición con menos fallos, o si clasifica correctamente que el problema no es la cobertura. La animación por sí sola no cuenta como resultado.
