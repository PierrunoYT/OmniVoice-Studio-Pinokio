# OmniVoice Studio (Pinokio)

A [Pinokio](https://pinokio.computer) launcher for [OmniVoice Studio](https://github.com/6Morpheus6/OmniVoice-Studio) — local voice cloning, video dubbing, and real-time dictation, with no API keys.

This repository contains **only** the launcher scripts. The application itself is cloned into `app/` by the **Install** step and is not tracked here.

## Menu actions

| Action | Script | What it does |
|--------|--------|--------------|
| **Install** | `install.js` | Installs system audio deps, clones the app and its TTS engines, builds the Python and frontend environments, downloads models. |
| **Start** | `start.js` | Runs the backend, the GPT-SoVITS API, and the frontend, then surfaces the web UI URL. |
| **Update** | `update.js` | `git pull` for the launcher, the app, and each TTS engine. |
| **Reset** | `reset.js` | Deletes `app/` to return to the pre-install state. |

**Start** only appears once `app/.installed` exists, which `install.js` writes as its final step — so a partially failed install will not offer to launch.

## Install

`install.js` requires Pinokio's **`ai` bundle** (which provides `git`, `uv`, `bun`, and the Hugging Face CLI) and runs, in order:

1. **System audio dependencies** — `sox` and `libaio` via `apt`, `yum`, `conda` (macOS), or `winget` (Windows), depending on what is available.
2. **Repositories** — `app/` plus the TTS engines under `app/TTS-Engines/`:
   - [MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano)
   - [CosyVoice](https://github.com/FunAudioLLM/CosyVoice) (with submodules)
   - [GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS)
3. **Frontend deps** — `bun install`.
4. **Python deps** — `uv sync` against the app's `pyproject.toml` into a single venv at **`app/.venv`**, then the engine requirement sets (`requirements_cv.txt`, `requirements_sov.txt`) and extras (`voxcpm`, `sherpa-onnx`, `argostranslate`, and `mlx-audio` on Apple Silicon). On Linux + NVIDIA, PyTorch is reinstalled from the CUDA 12.8 index.
5. **Models** — GPT-SoVITS pretrained weights (`lj1995/GPT-SoVITS`), UVR5 weights (`lj1995/VoiceConversionWebUI`), and the G2PW model, all from Hugging Face.

Expect a long first install: the repositories, the CUDA PyTorch build, and the model downloads together run to many gigabytes.

## Start

`start.js` is a daemon script with three processes:

| Process | Address | Command |
|---------|---------|---------|
| FastAPI backend | `127.0.0.1:3900` | `python -m uvicorn main:app --app-dir backend` |
| GPT-SoVITS API | `127.0.0.1:9880` | `python api_v2.py` (skipped if the engine is absent) |
| Vite frontend | port chosen by Vite | `bun run --cwd frontend dev` |

The frontend URL is captured from the Vite output and published to Pinokio, so **Open Web UI** appears in the menu once it is up.

### Environment variables set by `start.js`

| Variable | Value | Purpose |
|----------|-------|---------|
| `PYTHONUNBUFFERED` | `1` | Stream backend logs into the Pinokio terminal. |
| `HF_HUB_ENABLE_HF_TRANSFER` | `1` | Faster Hugging Face downloads. |
| `TORCH_COMPILE_DISABLE` | `1` | Avoid `torch.compile` at runtime. |
| `PYTHONPATH` | `TTS-Engines/CosyVoice` and `TTS-Engines/CosyVoice/third_party/Matcha-TTS` | Make CosyVoice and its bundled `matcha` package importable from the backend. |
| `TRANSLATE_BASE_URL` | `http://localhost:11434/v1` | OpenAI-compatible translation endpoint (an [Ollama](https://ollama.com) server by default). |
| `OMNIVOICE_GPTSOVITS_URL` | `http://127.0.0.1:9880` | Where the backend reaches the GPT-SoVITS API. |

Set **`HF_TOKEN`** in your Pinokio or user environment to avoid unauthenticated Hugging Face rate limits, and **`HF_ENDPOINT`** if you need a Hub mirror.

## Project layout

```
project-root/
├── app/                     # cloned by Install, git-ignored
│   ├── .venv/               # the single Python environment
│   ├── backend/  frontend/
│   └── TTS-Engines/         # MOSS-TTS-Nano, CosyVoice, GPT-SoVITS
├── install.js  start.js  update.js  reset.js
├── requirements_cv.txt  requirements_sov.txt
├── pinokio.js  pinokio.json  icon.png
└── README.md
```
