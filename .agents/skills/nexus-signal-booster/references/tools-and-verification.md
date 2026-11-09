# Herramientas mínimas y verificación

## Selección por necesidad
1. **Android integrado:** ajustes de SIM/red/datos, VPN, DNS privado y batería; solo revisar los apartados que correspondan al síntoma. Los nombres pueden variar según Android y fabricante.
2. **Navegador:** dos páginas ligeras e independientes para confirmar si el fallo es general o de un destino.
3. **Registro simple:** nota local o plantilla de experiment-log-template.md; no requiere cuenta ni nube.
4. **Medición opcional:** app reconocida de medición de red o pruebas web, revisando editor, permisos, privacidad y disponibilidad sin conexión. No instalar varias para comparar si una basta.
5. **ADB opcional:** solo si hay ordenador, cable de datos, depuración USB autorizada por el usuario y una pregunta técnica concreta. Los comandos de lectura primero; no usar root ni comandos destructivos.
6. **Web/documentación:** priorizar documentación oficial del fabricante, Android y operador para capacidades, bandas y ajustes. Separar dato oficial de experiencia anecdótica.
7. **Código/app propia:** solo si el flujo manual demuestra una necesidad real. El primer prototipo debe limitarse a registrar pruebas y mostrar tendencias; no afirmar que modifica el módem ni que “potencia” señal.

## Inspección Android
Antes de prometer una capacidad, comprobar:
- si el sistema la expone en esa versión y dispositivo;
- qué permisos exige;
- si requiere ubicación activada, SIM activa, acceso especial o ADB;
- si funciona sin Internet;
- si el dato es realmente señal celular o solo Wi-Fi/Internet;
- si una restricción de fabricante impide leerlo en segundo plano.

## Criterios de aceptación
- **Técnico:** afirmaciones separadas en confirmado, probable y desconocido.
- **Rápido:** la primera decisión útil aparece tras una o dos pruebas cortas, cuando el contexto lo permita.
- **Medible:** las mejoras tienen un antes/después reproducible o se marcan inconclusas.
- **Seguro:** cada ajuste tiene reversión y no compromete cuentas, privacidad o integridad del teléfono.
- **Práctico:** existe una ruta totalmente manual si faltan herramientas.
- **Honesto:** no se dice “resuelto” por crear documentación, escribir código o completar una lista; solo por validar el resultado real.

## Qué entregar al usuario
Un resumen breve con: síntoma clasificado, evidencia, hipótesis prioritaria, paso único recomendado, Plan B y resultado medido/no medido.