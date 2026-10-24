# Plan B, retroceso y cambios de rumbo

Cada prueba debe tener una alternativa sin depender de la herramienta o permiso que podría fallar.

| Bloqueo o resultado | Plan A | Plan B inmediato |
|---|---|---|
| No hay señal de datos | comprobar estado de SIM/red y posición | registrar hora/estado y comparar en otro punto u hora; no gastar tiempo en DNS |
| Barras, pero sin Internet | comprobar dos destinos y ajustes activos | comparar otra app/servicio y repetir más tarde; no cambiar APN a ciegas |
| No hay app de medición | usar una web ligera y registrar tiempos/errores | usar cronómetro manual y patrón de 3 intentos; marcar la precisión como limitada |
| Android oculta métricas | consultar información integrada disponible | usar mapa comparativo de lugares/horas y resultado real |
| No hay PC/ADB | flujo completamente desde el teléfono | crear registro manual y posponer solo la inspección que dependa de PC |
| Una app de prueba pide permisos excesivos | cancelar instalación/permiso | buscar herramienta mínima de fuente conocida o hacer prueba manual |
| Ajuste empeora conexión | revertir inmediatamente al estado anotado | restaurar ajustes originales y detener esa rama |
| La red está congestionada o la torre fuera de servicio | buscar otra hora/ubicación/tecnología disponible | conservar autonomía y preparar alternativa; ninguna optimización local garantiza restauración |
| ARK falla y otras apps funcionan | aislar etapa y hora del fallo | registrar evidencia, comprobar servicio/servidor más tarde y no reinstalar |
| La solución no mejora después de 3 pruebas comparables | detener esa hipótesis | cerrar como neutra/descartada y pasar a la alternativa más prometedora |
| Falta información fiable sobre bandas | buscar documentación del modelo/operador | no comprar todavía; elegir devolución fácil o mantener el diagnóstico manual |

## Reglas de retroceso
- Anotar el estado anterior antes de cada cambio.
- Cambiar una sola cosa por intento.
- No ejecutar acciones irreversibles para ahorrar tiempo.
- Restaurar inmediatamente si aparece empeoramiento, pérdida de acceso o comportamiento extraño.
- No repetir infinitamente la misma acción si no cambia el resultado.
- Ante dudas sobre permisos, coste, datos personales o cambios profundos, pausar y explicar el riesgo.

## Cambios de plan
La ruta se puede cambiar si la evidencia apunta a otra capa: radio, operador, Android, app, servidor o hardware. Actualizar la hipótesis y el registro; no mantener una idea solo porque ya se invirtió tiempo en ella.