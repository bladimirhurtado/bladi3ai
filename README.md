# 🧠 Bladi 3AI

Plataforma educativa web, móvil y offline-first para aprender programación, desarrollo web, Android e inteligencia artificial.

## Qué incluye

- 📚 4 cursos y 40 lecciones prácticas.
- 🎯 Objetivo diario configurable.
- 🔥 Racha de aprendizaje.
- 🏆 Insignias por avance y constancia.
- ⭐ Puntos y progreso por curso.
- 🚀 Continuar desde el último curso/lección.
- 🔎 Búsqueda y filtro por nivel.
- 🧩 Mini retos dentro de las lecciones.
- 💾 Guardado automático en el dispositivo.
- 📡 Funcionamiento offline mediante Service Worker.
- 💾 Exportación e importación del progreso en JSON para conservarlo o trasladarlo entre dispositivos.
- 📱 Diseño responsive y preparado para instalarse como PWA.
- 🎨 Icono propio de Bladi 3AI.

## Cursos

1. Programación Básica con Python — Inicial
2. Desarrollo Web HTML, CSS y JavaScript — Inicial
3. Desarrollo de Apps Android con Kotlin — Intermedio
4. IA y Machine Learning Práctico — Intermedio

## REA desde Android

Se añadió un menú de trabajo para Termux en [`rea.sh`](rea.sh). Instrucciones: [`docs/REA-MOVIL.md`](docs/REA-MOVIL.md). Desde la carpeta del repositorio, ejecuta `bash rea.sh`.

## BLADI REPLICA ENGINE

Se incorpora un motor modular de reconstrucción funcional clean-room con 11 etapas: reconocimiento, arquitectura, diseño, construcción, backend, pruebas, paridad, análisis de usuarios, identidad, lanzamiento y despliegue. No necesita dependencias externas ni claves API para su flujo local inicial.

Documentación y comandos: [bladi_replica_engine/README.md](bladi_replica_engine/README.md).

Ejemplo: `python -m bladi_replica_engine.cli init --workspace ./workspaces --name mi-app --target https://ejemplo.com`.

La versión inicial genera paquetes de instrucciones portables, registra resultados y mantiene el estado del proyecto. Los adaptadores para conectar proveedores de IA se desarrollarán por separado; publicar, desplegar o usar servicios de pago siempre requiere autorización explícita.

## Uso

La aplicación no necesita dependencias externas. Abre `index.html` desde un servidor web para disponer del comportamiento PWA/offline completo. En GitHub Pages se sirve directamente desde el repositorio.

## Datos

El progreso se guarda localmente en `localStorage` con la clave `bladi3ai_2026`. También puede exportarse e importarse como JSON. No depende de una cuenta ni de un servicio remoto para funcionar.

## Estado del proyecto

Versión consolidada: **2026-09-19**. Proyecto centralizado en este repositorio; no se crean versiones paralelas.

El proyecto se mantiene centralizado en este repositorio para evitar duplicar versiones innecesariamente.