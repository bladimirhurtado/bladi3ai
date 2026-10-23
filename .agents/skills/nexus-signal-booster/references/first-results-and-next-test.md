# Primeros resultados y siguiente prueba

## Evidencia previa del usuario
- Teléfono: TCL 605 Android.
- En ocasiones el modo avión provoca una reconexión temporal, pero la conexión se vuelve a perder enseguida.
- Las barras pueden mantenerse aunque Internet deje de funcionar.
- El problema se ha descrito en el contexto de Santa Clara, Villa Clara, Cuba, donde los cortes eléctricos coinciden a veces con caída de señal/datos.
- Ya se han intentado reinicios y limpiezas de caché/datos de Google Play Store, Play Games y Google Play services. No repetir estas acciones sin evidencia nueva.
- ARK Mobile 2.0 multijugador ha fallado en etapas online mientras el modo individual funcionaba en ocasiones. Eso no identifica todavía si el problema está en la red, la autenticación, el servicio o el servidor.

## Conclusión provisional (no diagnóstico definitivo)
Que el modo avión recupere la conexión solo brevemente es compatible con una sesión de red móvil atascada, cobertura/congestión variable o una condición del operador; por sí solo no permite elegir entre ellas. Las barras no garantizan una ruta de datos funcional. No hay aún una medición de radio, pérdida de paquetes o prueba simultánea con otra SIM/teléfono que permita confirmar la causa.

## Prueba única de mayor valor (2 minutos)
Cuando el fallo vuelva a estar presente:
1. Deja el teléfono donde está y no cambies otros ajustes.
2. Con datos móviles activos y Wi-Fi apagado, abre dos destinos independientes en el navegador o dos apps que normalmente funcionen.
3. Registra el resultado de cada una como: carga / tarda y falla / no conecta. Si una carga y la otra no, anótalo tal cual.
4. En el mismo momento, comprueba si ARK también falla y en qué etapa, solo si la conexión permite abrirlo sin repetir intentos en bucle.
5. No hagas todavía otro ciclo de modo avión ni cambies APN, DNS, VPN o tipo de red.

### Cómo decide el resultado
- **Ninguno de los dos destinos carga:** primero investigar conectividad móvil general; ARK no es el foco inicial.
- **Uno carga y otro no:** investigar destino, DNS o ruta, sin asumir falta de señal.
- **Ambos cargan, pero ARK falla:** aislar ARK/autenticación/servidor.
- **Todo funciona durante la prueba:** registrar hora y repetir solo cuando el fallo aparezca; una prueba hecha durante una recuperación no valida una solución.

## Plan B
Si no puedes hacer la prueba durante el fallo, no hagas cambios preventivos. Anota solo hora, estado de las barras, icono de datos (E/3G/4G/LTE u otro) y si el modo avión había recuperado la conexión brevemente. La próxima prueba se hace en el siguiente episodio real.

## Información pública contrastada
- La guía oficial de Android recomienda distinguir datos móviles de Wi‑Fi, comprobar el indicador de datos y probar el modo avión una vez; el usuario ya ha probado esa última acción, así que no se repite como solución principal: https://support.google.com/android/answer/2651367
- La ficha oficial del TCL 605 confirma la familia de producto, pero la variante regional exacta y las bandas de la unidad del usuario deben verificarse antes de recomendar ajustes de banda o hardware: https://www.tcl.com/global/en/mobile/tcl-605
- Las bandas de ETECSA deben verificarse por fuentes regulatorias y de operador para la zona/servicio concretos. No se debe inferir que el teléfono utiliza una banda concreta solo por la cobertura indicada en pantalla.

## Criterio para seguir avanzando
La primera prueba debe discriminar entre red móvil general y fallo de aplicación. Después se escoge solo la rama correspondiente. No se puede validar una mejora real sin una prueba en el TCL 605 durante un episodio de fallo.