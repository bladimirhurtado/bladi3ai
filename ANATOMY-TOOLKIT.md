# Anatomy Toolkit — listo para reutilizar

Anatomy es una **skill de agente del proyecto**, no una librería mágica que se activa en todos los chats. En este repositorio queda conservada en `.agents/skills/anatomy/`, con el código, ejemplos, referencias, kit, scripts y licencia upstream.

## Acceso rápido

- Skill: [`.agents/skills/anatomy/SKILL.md`](.agents/skills/anatomy/SKILL.md)
- Catálogo de ejemplos: [`.agents/skills/anatomy/examples/`](.agents/skills/anatomy/examples/)
- Herramientas reutilizables: [`.agents/skills/anatomy/kit/`](.agents/skills/anatomy/kit/)
- Referencias de construcción y verificación: [`.agents/skills/anatomy/references/`](.agents/skills/anatomy/references/)
- Demo de motor: [`demos/anatomy-four-cylinder-engine/index.html`](demos/anatomy-four-cylinder-engine/index.html)

## Qué pedirle al agente

En tareas de diagramas técnicos, mecanismos, figuras isométricas, objetos con piezas móviles o explicaciones interactivas, dile explícitamente:

> Usa la skill Anatomy de este repositorio. Lee primero `.agents/skills/anatomy/SKILL.md`, elige el ejemplo más parecido, reutiliza el kit cuando corresponda y verifica el resultado. No reemplaces la fuente original ni afirmes que algo funciona sin probarlo.

La instrucción de raíz [`AGENTS.md`](AGENTS.md) también orienta a los agentes que trabajen en este repositorio para que descubran y usen Anatomy en esos casos.

## Instalar Anatomy en otro proyecto

Desde la raíz de este repositorio, ejecuta:

```bash
bash scripts/install-anatomy.sh /ruta/al/otro-proyecto
```

El instalador descarga una versión fijada por commit desde el repositorio oficial, la instala en `.agents/skills/anatomy/`, comprueba archivos esenciales y crea `skills/anatomy` como ruta de compatibilidad **solo si esa ruta está libre**. Si ya existe una instalación, se detiene sin modificarla.

Para reemplazar una copia existente de forma deliberada, usa `--force`; el instalador mueve primero la copia anterior a una ruta de respaldo con marca de tiempo. Revisa el respaldo y la copia nueva antes de borrar nada.

## Requisitos y pruebas

- La instalación necesita conexión a internet y las herramientas `bash`, `curl` y `tar`.
- La skill documenta Node.js 20.10+ y Chrome/Chromium para sus comprobaciones de navegador.
- Para cambios en la skill, ejecuta primero las pruebas relevantes de `.agents/skills/anatomy/scripts/` y reconstruye un ejemplo representativo. Revisa el workflow `.github/workflows/sync-anatomy.yml` para el conjunto automatizado.
- La demo del motor de cuatro cilindros es un prototipo interactivo **SVG 2D**, no un modelo 3D completo. No mezcles esa demo con la fuente upstream de Anatomy.

## Conservación y límites

- La copia upstream está fijada al commit `be2fa9b47a7e4b05dec468be9ffc42e830c2101c` (Anatomy v1.1.0 según el registro del proyecto).
- Mantén Anatomy dentro de su carpeta y modifica demos/proyectos en rutas separadas.
- No copies claves API ni secretos a ejemplos.
- Esta instalación queda lista dentro de este repositorio y permite instalarla en otros repositorios. **No registra automáticamente una skill global en ChatGPT**: eso depende de las capacidades de la plataforma y del entorno donde se abra el proyecto.
