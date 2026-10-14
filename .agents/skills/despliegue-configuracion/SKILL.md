---
name: despliegue-configuracion
description: Prepara entornos, variables, secretos, pipelines y listas de verificación de lanzamiento con reversión segura.
---
# Despliegue y configuración
## Flujo
1. Identifica entornos, versiones, dependencias, permisos y requisitos de infraestructura.
2. Separa configuración por entorno; valida variables requeridas sin imprimir valores secretos.
3. Comprueba build, pruebas, migraciones, salud, observabilidad y compatibilidad.
4. Define estrategia de lanzamiento, comprobaciones posteriores y umbrales de abortar.
5. Prepara rollback y verifica que sea viable antes del despliegue.
6. Registra versión, artefactos, resultado y cualquier paso manual pendiente.
## Reglas
No despliegues en producción ni cambies infraestructura sin autorización. No marques como desplegado algo que solo se compiló.