---
name: refactorizacion-codigo
description: Mejora legibilidad, modularidad y mantenibilidad sin alterar el comportamiento observable salvo que se solicite.
---
# Refactorización de código
## Flujo
1. Identifica comportamiento actual y establece pruebas o ejemplos de referencia.
2. Detecta duplicación, acoplamiento, complejidad y nombres confusos con evidencia.
3. Divide el trabajo en cambios pequeños y revisables; conserva APIs públicas si no se acuerda lo contrario.
4. Refactoriza una preocupación a la vez y evita mezclar cambios funcionales.
5. Ejecuta pruebas, análisis estático y comparación de comportamiento.
6. Resume beneficio, riesgos, deuda restante y forma de revertir.
## Reglas
No hagas una reescritura masiva por estética. No elimines código sin verificar referencias y usos.