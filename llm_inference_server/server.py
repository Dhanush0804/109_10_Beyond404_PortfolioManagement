# pyright: reportMissingImports=false
import json
import os
import platform
import time
import uuid
from threading import Thread
from typing import Any, AsyncGenerator, List, Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from huggingface_hub import snapshot_download
from pydantic import BaseModel, Field, model_validator
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer


DEFAULT_SYSTEM_PROMPT = (
    "You are a highly professional Financial Adviser. Provide clear, structured, and responsible "
    "financial guidance tailored to the user's context. Be objective, practical, and transparent "
    "about uncertainty and risk. Avoid hype and unsupported claims. When useful, present concise "
    "step-by-step recommendations, assumptions, alternatives, and risk considerations."
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_ID = os.getenv("MODEL_ID", "microsoft/bitnet-b1.58-2B-4T")
MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(BASE_DIR, "models", "bitnet-b1.58-2B-4T"))
HF_TOKEN = os.getenv("HF_TOKEN")
INFERENCE_BACKEND = os.getenv("INFERENCE_BACKEND", "auto").strip().lower()

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8001"))

DTYPE = os.getenv("DTYPE", "bfloat16")
MAX_MODEL_LEN = int(os.getenv("MAX_MODEL_LEN", "8192"))
TENSOR_PARALLEL_SIZE = int(os.getenv("TENSOR_PARALLEL_SIZE", "1"))
GPU_MEMORY_UTILIZATION = float(os.getenv("GPU_MEMORY_UTILIZATION", "0.9"))
TRUST_REMOTE_CODE = os.getenv("TRUST_REMOTE_CODE", "true").strip().lower() == "true"

ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]

ENGINE_KIND: Optional[str] = None
VLLM_ENGINE = None
VLLM_SAMPLING_PARAMS = None
HF_MODEL = None
TOKENIZER = None
ACTIVE_MODEL_PATH: Optional[str] = None


def _has_native_bitnet_support() -> bool:
    try:
        from transformers.models.bitnet.configuration_bitnet import BitNetConfig  # noqa: F401
        from transformers.models.bitnet.modeling_bitnet import BitNetForCausalLM  # noqa: F401
        return True
    except Exception:
        return False


def _is_bitnet_model_config(config_path: str) -> bool:
    try:
        with open(config_path, "r", encoding="utf-8") as fp:
            cfg = json.load(fp)
        return str(cfg.get("model_type", "")).strip().lower() == "bitnet"
    except Exception:
        return False


def _resolve_trust_remote_code(model_path: str) -> bool:
    config_path = os.path.join(model_path, "config.json")
    if _is_bitnet_model_config(config_path) and _has_native_bitnet_support():
        return False
    return TRUST_REMOTE_CODE


def _required_remote_code_files(config_path: str) -> List[str]:
    """Infer required local python files from config auto_map entries."""
    try:
        with open(config_path, "r", encoding="utf-8") as fp:
            cfg = json.load(fp)
    except Exception:
        return []

    auto_map = cfg.get("auto_map") or {}
    needed = set()

    for _, value in auto_map.items():
        values = value if isinstance(value, list) else [value]
        for entry in values:
            if not isinstance(entry, str) or "." not in entry:
                continue
            module_name = entry.split(".", 1)[0].strip()
            if module_name:
                needed.add(f"{module_name}.py")

    return sorted(needed)


def _validate_local_model_dir(model_dir: str) -> bool:
    config_path = os.path.join(model_dir, "config.json")
    if not os.path.exists(config_path):
        return False

    # BitNet can load without dynamic files when transformers has native support.
    if _is_bitnet_model_config(config_path) and _has_native_bitnet_support():
        return True

    for filename in _required_remote_code_files(config_path):
        if not os.path.exists(os.path.join(model_dir, filename)):
            return False

    return True


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant", "tool"]
    content: str = Field(..., min_length=1)
    name: Optional[str] = None


class ChatCompletionRequest(BaseModel):
    model: Optional[str] = None
    messages: List[ChatMessage] = Field(..., min_length=1)
    temperature: float = Field(0.2, ge=0.0, le=2.0)
    top_p: float = Field(0.95, gt=0.0, le=1.0)
    max_tokens: int = Field(512, ge=1, le=4096)
    stream: bool = False

    @model_validator(mode="after")
    def validate_has_user_message(self) -> "ChatCompletionRequest":
        if not any(msg.role == "user" for msg in self.messages):
            raise ValueError("messages must include at least one user role entry")
        return self


app = FastAPI(title="OpenAI-compatible Inference Server", version="1.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _ensure_model_cached() -> str:
    os.makedirs(MODEL_DIR, exist_ok=True)
    if _validate_local_model_dir(MODEL_DIR):
        return MODEL_DIR

    snapshot_download(
        repo_id=MODEL_ID,
        local_dir=MODEL_DIR,
        local_dir_use_symlinks=False,
        token=HF_TOKEN,
        resume_download=True,
    )

    # If files are still incomplete (partial/corrupted cache), force-refresh once.
    if not _validate_local_model_dir(MODEL_DIR):
        snapshot_download(
            repo_id=MODEL_ID,
            local_dir=MODEL_DIR,
            local_dir_use_symlinks=False,
            token=HF_TOKEN,
            resume_download=False,
            force_download=True,
        )

    if not _validate_local_model_dir(MODEL_DIR):
        raise RuntimeError(
            f"Model cache at '{MODEL_DIR}' is incomplete. Delete the folder and retry, or verify access to '{MODEL_ID}'."
        )

    return MODEL_DIR


def _can_use_vllm() -> bool:
    if platform.system().lower().startswith("win"):
        return False
    return True


def _resolve_backend() -> str:
    if INFERENCE_BACKEND in {"vllm", "transformers"}:
        return INFERENCE_BACKEND
    if _can_use_vllm():
        return "vllm"
    return "transformers"


def _fallback_prompt(messages: List[dict]) -> str:
    lines: List[str] = []
    for message in messages:
        role = str(message.get("role", "user")).upper()
        content = str(message.get("content", "")).strip()
        if content:
            lines.append(f"[{role}] {content}")
    lines.append("[ASSISTANT]")
    return "\n".join(lines)


def _build_prompt(req: ChatCompletionRequest) -> str:
    message_dicts = [m.model_dump(exclude_none=True) for m in req.messages]

    if not any(m.get("role") == "system" for m in message_dicts):
        message_dicts.insert(0, {"role": "system", "content": DEFAULT_SYSTEM_PROMPT})

    if TOKENIZER is not None and hasattr(TOKENIZER, "apply_chat_template"):
        try:
            return TOKENIZER.apply_chat_template(
                message_dicts,
                tokenize=False,
                add_generation_prompt=True,
            )
        except Exception:
            return _fallback_prompt(message_dicts)

    return _fallback_prompt(message_dicts)


def _build_vllm_sampling_params(req: ChatCompletionRequest):
    if VLLM_SAMPLING_PARAMS is None:
        raise RuntimeError("vLLM sampling params class unavailable")
    return VLLM_SAMPLING_PARAMS(
        temperature=req.temperature,
        top_p=req.top_p,
        max_tokens=req.max_tokens,
    )


def _safe_usage(prompt_token_ids: Optional[List[int]], completion_token_ids: Optional[List[int]]) -> dict:
    prompt_tokens = len(prompt_token_ids) if prompt_token_ids else 0
    completion_tokens = len(completion_token_ids) if completion_token_ids else 0
    return {
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": prompt_tokens + completion_tokens,
    }


@app.on_event("startup")
async def startup_event() -> None:
    global ENGINE_KIND, VLLM_ENGINE, VLLM_SAMPLING_PARAMS, HF_MODEL, TOKENIZER, ACTIVE_MODEL_PATH

    ACTIVE_MODEL_PATH = _ensure_model_cached()
    effective_trust_remote_code = _resolve_trust_remote_code(ACTIVE_MODEL_PATH)
    TOKENIZER = AutoTokenizer.from_pretrained(ACTIVE_MODEL_PATH, trust_remote_code=effective_trust_remote_code)
    backend = _resolve_backend()

    if backend == "vllm":
        try:
            try:
                from vllm.engine.async_llm_engine import AsyncLLMEngine
                from vllm.engine.arg_utils import AsyncEngineArgs
            except ImportError:
                from vllm import AsyncLLMEngine, AsyncEngineArgs
            from vllm.sampling_params import SamplingParams

            engine_args = AsyncEngineArgs(
                model=ACTIVE_MODEL_PATH,
                tensor_parallel_size=TENSOR_PARALLEL_SIZE,
                dtype=DTYPE,
                max_model_len=MAX_MODEL_LEN,
                gpu_memory_utilization=GPU_MEMORY_UTILIZATION,
                trust_remote_code=effective_trust_remote_code,
            )
            VLLM_ENGINE = AsyncLLMEngine.from_engine_args(engine_args)
            VLLM_SAMPLING_PARAMS = SamplingParams
            ENGINE_KIND = "vllm"
            return
        except Exception as exc:
            if INFERENCE_BACKEND == "vllm":
                raise RuntimeError(f"Failed to initialize vLLM backend: {exc}") from exc

    # Transformers fallback for cross-platform compatibility.
    import torch

    dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
    model_kwargs = {
        "torch_dtype": dtype,
        "trust_remote_code": effective_trust_remote_code,
    }
    if torch.cuda.is_available():
        model_kwargs["device_map"] = "auto"

    HF_MODEL = AutoModelForCausalLM.from_pretrained(ACTIVE_MODEL_PATH, **model_kwargs)
    if not torch.cuda.is_available():
        HF_MODEL = HF_MODEL.to("cpu")
    ENGINE_KIND = "transformers"


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok" if ENGINE_KIND is not None else "starting",
        "backend": ENGINE_KIND,
        "model_id": MODEL_ID,
        "model_path": ACTIVE_MODEL_PATH,
    }


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatCompletionRequest):
    if ENGINE_KIND is None:
        raise HTTPException(status_code=503, detail="Model engine is not ready yet")

    request_id = f"chatcmpl-{uuid.uuid4().hex}"
    created_at = int(time.time())

    try:
        prompt = _build_prompt(req)
        sampling_params = _build_vllm_sampling_params(req) if ENGINE_KIND == "vllm" else None
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid request: {exc}") from exc

    if req.stream:
        return StreamingResponse(
            _stream_chat_response(request_id, created_at, req, prompt, sampling_params),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    try:
        if ENGINE_KIND == "vllm":
            final_output = None
            async for output in VLLM_ENGINE.generate(prompt, sampling_params, request_id):
                final_output = output

            if final_output is None or not final_output.outputs:
                raise HTTPException(status_code=500, detail="No output generated")

            result = final_output.outputs[0]
            response_text = result.text
            finish_reason = result.finish_reason or "stop"
            usage = _safe_usage(final_output.prompt_token_ids, result.token_ids)
        else:
            import torch

            if HF_MODEL is None or TOKENIZER is None:
                raise HTTPException(status_code=503, detail="Transformers backend is not ready yet")

            model_device = next(HF_MODEL.parameters()).device
            input_ids = TOKENIZER(prompt, return_tensors="pt").input_ids.to(model_device)

            with torch.no_grad():
                outputs = HF_MODEL.generate(
                    input_ids=input_ids,
                    max_new_tokens=req.max_tokens,
                    temperature=req.temperature,
                    top_p=req.top_p,
                    do_sample=req.temperature > 0,
                    pad_token_id=TOKENIZER.eos_token_id,
                )

            generated_ids = outputs[0][input_ids.shape[-1]:]
            response_text = TOKENIZER.decode(generated_ids, skip_special_tokens=True)
            finish_reason = "stop"
            usage = {
                "prompt_tokens": int(input_ids.shape[-1]),
                "completion_tokens": int(generated_ids.shape[-1]),
                "total_tokens": int(input_ids.shape[-1] + generated_ids.shape[-1]),
            }

        return JSONResponse(
            {
                "id": request_id,
                "object": "chat.completion",
                "created": created_at,
                "model": req.model or MODEL_ID,
                "choices": [
                    {
                        "index": 0,
                        "message": {"role": "assistant", "content": response_text},
                        "finish_reason": finish_reason,
                    }
                ],
                "usage": usage,
            }
        )
    except HTTPException:
        raise
    except Exception as exc:
        try:
            if ENGINE_KIND == "vllm" and VLLM_ENGINE is not None:
                await VLLM_ENGINE.abort(request_id)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Inference error: {exc}") from exc


async def _stream_chat_response(
    request_id: str,
    created_at: int,
    req: ChatCompletionRequest,
    prompt: str,
    sampling_params,
) -> AsyncGenerator[str, None]:
    if ENGINE_KIND is None:
        yield "data: " + json.dumps({"error": {"message": "Model engine is not ready yet"}}) + "\n\n"
        yield "data: [DONE]\n\n"
        return

    initial_chunk = {
        "id": request_id,
        "object": "chat.completion.chunk",
        "created": created_at,
        "model": req.model or MODEL_ID,
        "choices": [{"index": 0, "delta": {"role": "assistant"}, "finish_reason": None}],
    }
    yield f"data: {json.dumps(initial_chunk, ensure_ascii=False)}\n\n"

    sent_len = 0

    try:
        if ENGINE_KIND == "vllm":
            async for output in VLLM_ENGINE.generate(prompt, sampling_params, request_id):
                if not output.outputs:
                    continue

                result = output.outputs[0]
                text = result.text or ""
                delta_text = text[sent_len:]
                sent_len = len(text)

                if delta_text:
                    chunk = {
                        "id": request_id,
                        "object": "chat.completion.chunk",
                        "created": created_at,
                        "model": req.model or MODEL_ID,
                        "choices": [{"index": 0, "delta": {"content": delta_text}, "finish_reason": None}],
                    }
                    yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"

                if result.finish_reason is not None:
                    done_chunk = {
                        "id": request_id,
                        "object": "chat.completion.chunk",
                        "created": created_at,
                        "model": req.model or MODEL_ID,
                        "choices": [{"index": 0, "delta": {}, "finish_reason": result.finish_reason}],
                    }
                    yield f"data: {json.dumps(done_chunk, ensure_ascii=False)}\n\n"
                    break
        else:
            import torch

            if HF_MODEL is None or TOKENIZER is None:
                raise RuntimeError("Transformers backend is not ready yet")

            model_device = next(HF_MODEL.parameters()).device
            input_ids = TOKENIZER(prompt, return_tensors="pt").input_ids.to(model_device)

            streamer = TextIteratorStreamer(TOKENIZER, skip_special_tokens=True)
            generation_kwargs = {
                "input_ids": input_ids,
                "max_new_tokens": req.max_tokens,
                "temperature": req.temperature,
                "top_p": req.top_p,
                "do_sample": req.temperature > 0,
                "pad_token_id": TOKENIZER.eos_token_id,
                "streamer": streamer,
            }

            thread = Thread(target=HF_MODEL.generate, kwargs=generation_kwargs)
            thread.start()

            for piece in streamer:
                if not piece:
                    continue
                chunk = {
                    "id": request_id,
                    "object": "chat.completion.chunk",
                    "created": created_at,
                    "model": req.model or MODEL_ID,
                    "choices": [{"index": 0, "delta": {"content": piece}, "finish_reason": None}],
                }
                yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"

            thread.join()
            done_chunk = {
                "id": request_id,
                "object": "chat.completion.chunk",
                "created": created_at,
                "model": req.model or MODEL_ID,
                "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
            }
            yield f"data: {json.dumps(done_chunk, ensure_ascii=False)}\n\n"

    except Exception as exc:
        try:
            if ENGINE_KIND == "vllm" and VLLM_ENGINE is not None:
                await VLLM_ENGINE.abort(request_id)
        except Exception:
            pass

        error_chunk = {
            "id": request_id,
            "object": "chat.completion.chunk",
            "created": created_at,
            "model": req.model or MODEL_ID,
            "choices": [{"index": 0, "delta": {}, "finish_reason": "error"}],
            "error": {"message": f"Inference error: {exc}"},
        }
        yield f"data: {json.dumps(error_chunk, ensure_ascii=False)}\n\n"

    yield "data: [DONE]\n\n"


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host=HOST, port=PORT, reload=False)
