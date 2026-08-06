# vLLM Inference Server Runbook

## Why your install failed

You are currently using:
- OS: Windows
- Python: 3.13

This server uses `vLLM==0.7.2`, which requires Linux runtime support and a compatible PyTorch build (`torch==2.5.1` for this vLLM line). Native Windows + Python 3.13 cannot satisfy that dependency chain.

## Working setup (recommended)

Use **WSL2 Ubuntu** with NVIDIA CUDA passthrough and Python **3.11** or **3.12**.

## 1) Enter WSL Ubuntu

```bash
wsl
```

## 2) Create and activate environment

```bash
cd /mnt/c/Users/Administrator/Desktop/capstone/109_10_Beyond404_PortfolioManagement/llm_inference_server
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

## 3) Install dependencies

```bash
pip install -r requirements.txt
```

## 4) Configure model cache path (download once, reuse on restart)

```bash
export MODEL_ID="microsoft/bitnet-b1.58-2B-4T-bf16"
export MODEL_DIR="/mnt/c/Users/Administrator/Desktop/capstone/109_10_Beyond404_PortfolioManagement/llm_inference_server/models/bitnet-b1.58-2B-4T-bf16"
export ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
export PORT="8001"
```

## 5) Start server

```bash
python server.py
```

## 6) Test endpoints

Health:

```bash
curl http://localhost:8001/health
```

Chat completion:

```bash
curl -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Give me a conservative monthly investment plan."}],
    "temperature": 0.2,
    "top_p": 0.95,
    "max_tokens": 256
  }'
```

Streaming:

```bash
curl -N -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Create a risk-aware ETF allocation checklist."}],
    "stream": true,
    "max_tokens": 256
  }'
```

## Notes

- Model weights are downloaded only if `MODEL_DIR/config.json` is missing.
- On restart, existing cached model path is reused.
- If you want native Windows inference, switch from vLLM to a different backend (for example llama.cpp/Ollama/TGI), because vLLM itself is Linux-first.
