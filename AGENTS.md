# Instrucciones para agentes del repositorio

## Reutilizar Anatomy

Cuando una tarea requiera un diagrama técnico, una ilustración isométrica, una explicación visual interactiva, un mecanismo animado o una figura de producto detallada, revisa primero `.agents/skills/anatomy/SKILL.md`. Si la skill está presente, úsala como herramienta de trabajo: inspecciona un ejemplo cercano, aprovecha `kit/` y `references/`, y aplica las verificaciones indicadas por la skill.

- Conserva intacta la copia upstream de Anatomy salvo que la tarea sea expresamente mantener o actualizar esa skill.
- Coloca demostraciones y adaptaciones en carpetas separadas (por ejemplo, `demos/`).
- Verifica el resultado con las pruebas disponibles; diferencia con claridad lo probado de lo que aún es un prototipo.
- No afirmes que una interacción funciona si no se ha comprobado.
- Para instalar la skill en otro proyecto, sigue `ANATOMY-TOOLKIT.md` y usa `scripts/install-anatomy.sh`; nunca sobrescribas una carpeta existente sin respaldo.
