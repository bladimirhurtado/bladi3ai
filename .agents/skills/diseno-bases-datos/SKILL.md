---
name: diseno-bases-datos
description: Modela esquemas y consultas de bases de datos con integridad, migraciones seguras y rendimiento medible.
---
# Diseño de bases de datos
## Flujo
1. Define entidades, relaciones, reglas de negocio, volumen, consultas y retención.
2. Elige modelo y tipos de datos adecuados; establece claves, restricciones e índices justificados.
3. Considera privacidad, permisos, auditoría, borrado y ciclo de vida de los datos.
4. Diseña migraciones repetibles, compatibles y con plan de reversión.
5. Examina planes de consulta y mide rendimiento con datos representativos.
6. Prueba integridad, concurrencia, límites y recuperación desde respaldo cuando sea posible.
## Reglas
No ejecutes migraciones destructivas sin respaldo y autorización. No almacenes secretos ni datos sensibles sin necesidad.