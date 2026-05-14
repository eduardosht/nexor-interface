#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ps_script="$script_dir/start-dev.ps1"

if [[ ! -f "$ps_script" ]]; then
  echo "Script nao encontrado: $ps_script" >&2
  exit 1
fi

ps_args=()

for arg in "$@"; do
  case "$arg" in
    -InstallDeps|--install-deps)
      ps_args+=("-InstallDeps")
      ;;
    *)
      echo "Argumento nao suportado: $arg" >&2
      echo "Uso: ./start-dev.sh [--install-deps]" >&2
      exit 1
      ;;
  esac
done

exec powershell.exe -ExecutionPolicy Bypass -File "$ps_script" "${ps_args[@]}"
