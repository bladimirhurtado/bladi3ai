#!/data/data/com.termux/files/usr/bin/bash
# REA — menú de trabajo móvil para Termux.
# Usa únicamente herramientas locales; no instala paquetes ni ejecuta archivos analizados.

set -u
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
PYTHON="${PYTHON:-python}"

if ! command -v "$PYTHON" >/dev/null 2>&1; then
  echo "ERROR: no encuentro Python. En Termux instala Python con: pkg install python"
  exit 1
fi
if [ ! -f "$ROOT/scripts/dev_agent.py" ] || [ ! -f "$ROOT/scripts/re_triage.py" ]; then
  echo "ERROR: faltan herramientas de REA dentro de: $ROOT"
  echo "Abre este script desde la carpeta raíz del repositorio bladi3ai."
  exit 1
fi

while true; do
  echo
  echo "================================"
  echo "       REA — MENU MOVIL"
  echo "================================"
  echo "Carpeta: $ROOT"
  echo "1) Inspeccionar un proyecto"
  echo "2) Revisar posibles problemas"
  echo "3) Crear plan de mejoras"
  echo "4) Analizar un archivo (solo lectura)"
  echo "5) Comprobar instalación de REA"
  echo "0) Salir"
  printf "Elige una opción: "
  IFS= read -r choice || exit 0

  case "$choice" in
    1|2|3)
      printf "Ruta del proyecto [Enter = carpeta de REA]: "
      IFS= read -r target
      [ -n "$target" ] || target="$ROOT"
      case "$choice" in
        1) "$PYTHON" "$ROOT/scripts/dev_agent.py" inspect "$target" ;;
        2) "$PYTHON" "$ROOT/scripts/dev_agent.py" review "$target" ;;
        3) "$PYTHON" "$ROOT/scripts/dev_agent.py" plan "$target" ;;
      esac
      ;;
    4)
      printf "Ruta completa del archivo a analizar: "
      IFS= read -r target
      if [ -n "$target" ]; then
        "$PYTHON" "$ROOT/scripts/re_triage.py" "$target"
      else
        echo "No se indicó ningún archivo."
      fi
      ;;
    5)
      echo "Python:"
      "$PYTHON" --version
      echo
      echo "Herramientas:"
      for tool in "$ROOT/scripts/dev_agent.py" "$ROOT/scripts/re_triage.py" "$ROOT/scripts/validate-skills.py"; do
        if [ -f "$tool" ]; then echo "OK  $tool"; else echo "FALTA  $tool"; fi
      done
      echo
      echo "Pruebas del proyecto (si están disponibles):"
      if [ -d "$ROOT/tests" ]; then
        "$PYTHON" -m unittest discover -s "$ROOT/tests" -v
      else
        echo "No existe la carpeta tests."
      fi
      ;;
    0) echo "REA cerrada."; exit 0 ;;
    *) echo "Opción no válida. Elige 0, 1, 2, 3, 4 o 5." ;;
  esac
  printf "\nPulsa Enter para volver al menú..."
  IFS= read -r _
done
