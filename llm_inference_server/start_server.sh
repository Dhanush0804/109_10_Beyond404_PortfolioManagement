#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[info] Starting inference server bootstrap..."

OS_NAME="$(uname -s || true)"
IS_WINDOWS_BASH="false"
case "$OS_NAME" in
  MINGW*|MSYS*|CYGWIN*) IS_WINDOWS_BASH="true" ;;
esac

PYTHON_BIN="${PYTHON_BIN:-}"
if [[ -z "$PYTHON_BIN" ]]; then
  if command -v python3.11 >/dev/null 2>&1; then
    PYTHON_BIN="python3.11"
  elif command -v python3.12 >/dev/null 2>&1; then
    PYTHON_BIN="python3.12"
  elif command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
  elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
  elif command -v py >/dev/null 2>&1; then
    PYTHON_BIN="py -3"
  else
    echo "[error] Python not found. Install Python 3.10+ first."
    exit 1
  fi
fi

if ! eval "$PYTHON_BIN" - <<'PY'
import sys
ok = (sys.version_info.major == 3 and sys.version_info.minor >= 10)
raise SystemExit(0 if ok else 1)
PY
then
  echo "[error] Unsupported Python version. Use Python 3.10+ (3.11/3.12 recommended)."
  eval "$PYTHON_BIN" --version || true
  exit 1
fi

VENV_DIR="${VENV_DIR:-.venv}"
if [[ ! -d "$VENV_DIR" ]]; then
  echo "[info] Creating virtual environment at $VENV_DIR"
  eval "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

if [[ -f "$VENV_DIR/bin/activate" ]]; then
  # shellcheck disable=SC1090
  source "$VENV_DIR/bin/activate"
elif [[ -f "$VENV_DIR/Scripts/activate" ]]; then
  # shellcheck disable=SC1090
  source "$VENV_DIR/Scripts/activate"
else
  echo "[error] Could not find virtual environment activation script."
  exit 1
fi

python -m pip install --upgrade pip setuptools wheel >/dev/null

if [[ -z "${INFERENCE_BACKEND:-}" ]]; then
  if [[ "$IS_WINDOWS_BASH" == "true" ]]; then
    export INFERENCE_BACKEND="transformers"
  elif python - <<'PY' >/dev/null 2>&1
import importlib
import sys
if sys.version_info[:2] not in {(3, 11), (3, 12)}:
    raise SystemExit(1)
importlib.import_module("vllm")
raise SystemExit(0)
PY
  then
    export INFERENCE_BACKEND="vllm"
  else
    export INFERENCE_BACKEND="transformers"
  fi
fi

echo "[info] Selected backend: $INFERENCE_BACKEND"

missing_deps="$(python - <<'PY'
import importlib
import os

mods = [
    ("fastapi", "fastapi"),
    ("uvicorn", "uvicorn"),
    ("pydantic", "pydantic"),
    ("transformers", "transformers"),
    ("huggingface_hub", "huggingface_hub"),
    ("torch", "torch"),
    ("accelerate", "accelerate"),
]

if os.getenv("INFERENCE_BACKEND", "auto").lower() == "vllm":
    mods.append(("vllm", "vllm"))

missing = []
for module_name, package_name in mods:
    try:
        importlib.import_module(module_name)
    except Exception:
        missing.append(package_name)

print(" ".join(missing))
PY
)"

if [[ -n "$missing_deps" ]]; then
  echo "[info] Missing dependencies detected: $missing_deps"
  echo "[info] Installing dependencies from requirements.txt"
  pip install -r requirements.txt
else
  echo "[info] All required dependencies already available."
fi

BITNET_SUPPORT_OK="0"
if python - <<'PY' >/dev/null 2>&1
try:
    from transformers.models.bitnet.configuration_bitnet import BitNetConfig  # noqa: F401
    from transformers.models.bitnet.modeling_bitnet import BitNetForCausalLM  # noqa: F401
    raise SystemExit(0)
except Exception:
    raise SystemExit(1)
PY
then
  BITNET_SUPPORT_OK="1"
fi

if [[ "$BITNET_SUPPORT_OK" != "1" ]]; then
  echo "[info] BitNet classes not found in current transformers build. Installing required transformers commit..."
  pip install -q --upgrade "git+https://github.com/huggingface/transformers.git@096f25ae1f501a084d8ff2dcaf25fbc2bd60eba4"
fi

export MODEL_ID="${MODEL_ID:-microsoft/bitnet-b1.58-2B-4T}"
export MODEL_DIR="${MODEL_DIR:-$SCRIPT_DIR/models/bitnet-b1.58-2B-4T}"
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://localhost:5173,http://127.0.0.1:5173}"
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-8001}"

mkdir -p "$MODEL_DIR"

echo "[info] MODEL_ID=$MODEL_ID"
echo "[info] MODEL_DIR=$MODEL_DIR"
echo "[info] INFERENCE_BACKEND=$INFERENCE_BACKEND"
echo "[info] HOST=$HOST PORT=$PORT"
echo "[info] Launching server..."

exec python server.py
