# BLADI REPLICA ENGINE

Motor modular de análisis y reconstrucción funcional, integrado como componente independiente de Bladi 3AI / REA. Versión inicial: **0.1.0**.

## Qué hace

Coordina 11 etapas: reconocimiento, arquitectura, diseño, construcción, backend, pruebas, comparación funcional, análisis de usuarios, identidad, lanzamiento y despliegue.

Esta versión crea proyectos, genera instrucciones portables para asistentes compatibles, recibe resultados, registra el avance y produce un manifiesto. No es todavía un agente autónomo conectado a todas las IA. Los adaptadores API se incorporarán por separado, usando credenciales del usuario y proveedores gratuitos/locales cuando existan.

## Requisitos

Python 3.8 o superior. Solo biblioteca estándar: no requiere pip, cuenta externa ni API key.

## Uso

Desde la raíz del repositorio:

    python -m bladi_replica_engine.cli init --workspace ./workspaces --name mi-app --target https://ejemplo.com
    python -m bladi_replica_engine.cli status ./workspaces/mi-app
    python -m bladi_replica_engine.cli prepare ./workspaces/mi-app

El comando prepare crea prompts/recon.md. Entrega ese archivo a una IA, revisa su resultado y guárdalo como Markdown. Después:

    python -m bladi_replica_engine.cli complete ./workspaces/mi-app --stage recon --result ./resultado-recon.md
    python -m bladi_replica_engine.cli prepare ./workspaces/mi-app
    python -m bladi_replica_engine.cli manifest ./workspaces/mi-app

Se puede preparar cualquier etapa con --stage. Las etapas completadas se registran en project.json.

## Las 11 etapas

| ID | Función |
| --- | --- |
| recon | Inventario de pantallas, estados, flujos y funciones |
| architect | Arquitectura, datos, APIs y seguridad |
| design | Tokens, componentes y accesibilidad |
| build | Implementación original por incrementos |
| backend | Autenticación, persistencia e integraciones |
| test | Pruebas y registro de defectos |
| diff | Comparación funcional y brechas |
| entrepreneur | Investigación verificable de necesidades |
| brand | Identidad diferenciada |
| launch | Materiales y controles de lanzamiento |
| deploy | Preflight y despliegue con aprobación |

## Seguridad y límites

- Solo fuentes públicas y cuentas/materiales para los que exista autorización.
- No extrae contenido detrás de login, no evade paywalls ni controles de acceso.
- No copia código, marcas, textos, activos, catálogos ni APIs privadas.
- No ejecuta código generado, no instala dependencias, no publica ni despliega por sí solo.
- Las integraciones de pago, publicación, acceso a red o acciones destructivas requieren aprobación explícita.
- No se garantiza paridad perfecta; cada conclusión debe llevar evidencia y nivel de confianza.

## Pruebas

    python -m unittest discover -s tests -p 'test_bladi_replica*.py' -v
