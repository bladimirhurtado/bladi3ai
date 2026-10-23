# Primeros resultados y siguiente prueba

## Evidencia aportada por el usuario
- Teléfono: TCL 605 Android.
- Contexto: Santa Clara, Villa Clara, Cuba; la conexión móvil suele empeorar cuando se va la corriente y normalmente mejora en otros lugares donde sí hay electricidad. No obstante, también puede fallar cuando hay corriente.
- En ocasiones el usuario puede conectarse a ChatGPT aunque la conexión esté mala, pero ARK necesita una conexión más estable para el multijugador.
- Los fallos de ARK varían: en diferentes ocasiones puede fallar el inicio de sesión de Google Play Games, la carga/listado de servidores o la sesión de juego/desconexión.
- En ocasiones el modo avión provoca una reconexión temporal, pero la conexión vuelve a fallar enseguida.
- Las barras pueden mantenerse aunque Internet deje de funcionar.
- Ya se han intentado reinicios y limpiezas de caché/datos de Google Play Store, Play Games y Google Play services. No repetir estas acciones sin evidencia nueva.
- ARK Mobile 2.0 multijugador ha fallado en etapas online mientras el modo individual funcionaba en ocasiones. Eso no identifica todavía si el problema está en la red, la autenticación, el servicio o el servidor.

## Conclusión provisional (no diagnóstico definitivo)
El patrón sugiere que las condiciones de conectividad móvil y los fallos propios de ARK/Google Play Games podrían coexistir. Los apagones coinciden con peor servicio, pero la correlación no demuestra por sí sola la causa: pueden influir cobertura/interferencia, congestión, alimentación de equipos de red o condiciones del operador. Que ChatGPT cargue no demuestra que la conexión sea suficientemente estable para un juego en tiempo real; una conversación tolera latencia y pausas que pueden interrumpir una sesión multijugador. Los fallos en etapas distintas también podrían tener causas diferentes. No hay todavía mediciones de radio, latencia/pérdida ni comparación simultánea con otra SIM/teléfono que permitan confirmar la causa.

## Prueba única de mayor valor (2 minutos)
Cuando el fallo vuelva a estar presente:
1. Deja el teléfono donde está y no cambies otros ajustes.
2. Con datos móviles activos y Wi-Fi apagado, abre dos destinos independientes en el navegador o dos apps que normalmente funcionen.
3. Registra cada resultado como: carga / tarda y falla / no conecta.
4. Si ambos destinos cargan, anota si ARK falla en el inicio de sesión, en la lista/entrada al servidor o durante la partida. No hagas intentos repetidos en bucle.
5. No hagas otro ciclo de modo avión ni cambies APN, DNS, VPN o tipo de red durante esta prueba: necesitamos observar el fallo antes de alterar el estado.

## Cómo decide el resultado
- **Ninguno de los dos destinos carga:** priorizar conectividad móvil general; ARK no es el foco inicial.
- **Uno carga y otro no:** investigar destino, DNS o ruta, sin asumir falta de señal.
- **Ambos cargan, pero ARK falla antes de entrar:** investigar por separado autenticación, Play Games, lista/servidor y versión de la aplicación.
- **ARK entra pero se congela o desconecta:** priorizar estabilidad, latencia y pérdida de paquetes, sin descartar el servidor.
- **Todo funciona durante la prueba:** registrar hora y repetir solo cuando reaparezca el fallo; una prueba hecha durante una recuperación no valida una solución.

## Plan B
Si no puedes hacer la prueba durante el fallo, no hagas cambios preventivos. Anota solo: hora aproximada, si hay corriente en casa, icono de red móvil (E/3G/4G/LTE u otro), si las barras permanecen, qué otras apps cargan y en qué etapa falla ARK. No hace falta hacer un registro largo.

## Información pública contrastada
- La guía oficial de Android recomienda distinguir datos móviles de Wi-Fi, comprobar el indicador de datos y probar el modo avión una vez; el usuario ya ha probado esa última acción, así que no se repite como solución principal: https://support.google.com/android/answer/2651367
- La ficha oficial del TCL 605 confirma la familia de producto, pero la variante regional exacta y las bandas de la unidad del usuario deben verificarse antes de recomendar ajustes de banda o hardware: https://www.tcl.com/global/en/mobile/tcl-605
- Las bandas de ETECSA deben verificarse por fuentes regulatorias y de operador para la zona/servicio concretos. No se debe inferir que el teléfono utiliza una banda concreta solo por la cobertura indicada en pantalla.

## Criterio para seguir avanzando
La siguiente prueba debe separar conectividad general de fallo de aplicación y registrar si hay corriente en casa. Después se escoge solo la rama correspondiente. No se puede validar una mejora real sin una prueba en el TCL 605 durante un episodio de fallo.
