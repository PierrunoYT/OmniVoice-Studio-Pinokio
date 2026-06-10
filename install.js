module.exports = {
  requires: {
    bundle: "ai"
  },
  run: [
    // Clone the OmniVoice Studio repository
    {
      when: "{{!exists('app')}}",
      method: "shell.run",
      params: {
        message: "git clone https://github.com/6Morpheus6/OmniVoice-Studio app",
      },
    },
    // Clone the MOSS-TTS-Nano repository into the TTS-Engines directory
    {
      when: "{{!exists('app/TTS-Engines/MOSS-TTS-Nano')}}",
      method: "shell.run",
      params: {
        path: "app",
        message: "git clone https://github.com/OpenMOSS/MOSS-TTS-Nano TTS-Engines/MOSS-TTS-Nano",
      },
    },
    // Clone the CosyVoice repository into the TTS-Engines directory
    {
      when: "{{!exists('app/TTS-Engines/CosyVoice')}}",
      method: "shell.run",
      params: {
        path: "app",
        message: "git clone --recursive https://github.com/FunAudioLLM/CosyVoice TTS-Engines/CosyVoice",
      },
    },
    // Update CosyVoice submodule
    {
      when: "{{exists('app/TTS-Engines/CosyVoice')}}",
      method: "shell.run",
      params: {
        path: "app/TTS-Engines/CosyVoice",
        message: "git submodule update --init --recursive",
      },
    },
    // Clone the GPT-SoVITS repository into the TTS-Engines directory
    {
      when: "{{!exists('app/TTS-Engines/GPT-SoVITS')}}",
      method: "shell.run",
      params: {
        path: "app",
        message: "git clone https://github.com/RVC-Boss/GPT-SoVITS TTS-Engines/GPT-SoVITS",
      },
    },
/*     // Clone the index-tts repository into the TTS-Engines directory
    {
      method: "shell.run",
      params: {
        env: { GIT_LFS_SKIP_SMUDGE: "1" },
        path: "app",
        message: "git clone https://github.com/index-tts/index-tts.git TTS-Engines/index-tts",
      },
    }, */
    // Install Node.js (bun) dependencies for the frontend
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "bun install",
      },
    },
    // Install Python dependencies via uv sync
    // uv sync reads pyproject.toml and installs torch+CUDA automatically
    {
      method: "shell.run",
      params: {
        venv: ".venv",
        path: "app",
        message: [
          "uv sync",
          "uv pip install voxcpm openai sherpa-onnx wheel wheel_stub setuptools==80.9.0"
        ]
      },
    },
    // Install MOSS-TTS-Nano dependencies
    {
      method: "shell.run",
      params: {
        venv: "../../.venv",
        path: "app/TTS-Engines/MOSS-TTS-Nano",
        message: [
          "uv pip install -e . --no-deps"
        ]
      },
    },
/*     {
      method: "shell.run",
      params: {
        env: { UV_PYTHON: "3.11" },
        path: "app/TTS-Engines/index-tts",
        message: [
          "uv pip install -e ."
        ]
      },
    }, */
    {
      when: "{{gpu === 'nvidia' && platform === 'linux'}}",
      method: "shell.run",
      params: {
        venv: ".venv",
        path: "app",
        message: [
          "uv pip install torch==2.8.0 torchvision==0.23.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cu128 --force-reinstall"
        ]
      },
    },
    // Install CosyVoice dependencies
    {
      method: "shell.run",
      params: {
        venv: ".venv",
        path: "app",
        message: [
          "uv pip install -r ../requirements_cv.txt --index-strategy unsafe-best-match --no-build-isolation"
        ]
      },
    },
    // Install GPT-SoVITS dependencies
    {
      method: "shell.run",
      params: {
        venv: ".venv",
        path: "app",
        message: [
          "uv pip install -r ../requirements_sov.txt"
        ]
      },
    },
    // Install mlx-audio for Macs
    {
      when: "{{platform === 'darwin' && arch === 'arm64'}}",
      method: "shell.run",
      params: {
        venv: ".venv",
        path: "app",
        message: [
          "uv pip install mlx-audio"
        ]
      },
    },
    //faster-whisper fix and argotranslate for local translation
    {
      method: "shell.run",
      params: {
        venv: ".venv",
        path: "app",
        message: "uv pip install setuptools==65.5.0 ctranslate2==4.6.0 argostranslate"
      },
    },
    // Download GPT-SoVITS pretrained models from Hugging Face
    {
      method: "hf.download",
      params: {
        path: "app/TTS-Engines/GPT-SoVITS/GPT_SoVITS",
        "_": [ "lj1995/GPT-SoVITS" ],
        "local-dir": "pretrained_models"
      },
    },
    // Download UVR5 weights from Hugging Face
    {
      method: "shell.run",
      params: {
        path: "app/TTS-Engines/GPT-SoVITS/tools/uvr5",
        message: 'hf download lj1995/VoiceConversionWebUI --include="uvr5_weights/*" --local-dir=uvr5_weights && dir'
      },
    },
    // Download G2P models from Hugging Face
    {
      method: "hf.download",
      params: {
        path: "app/TTS-Engines/GPT-SoVITS/GPT_SoVITS/text",
        "_": [ "IQ-Technology/G2PWModel" ],
        "local-dir": "G2PWModel"
      },
    },
    // Install SOX and libaio dependencies
    {
      when: "{{which('apt')}}",
      method: "shell.run",
      params: {
        sudo: true,
        message: "apt-get install -y libaio-dev sox libsox-fmt-all"
      },
      next: null
    },
    {
      when: "{{which('yum')}}",
      method: "shell.run",
      params: {
        sudo: true,
        message: "yum install -y libaio-devel sox"
      },
      next: null
    },
    {
      when: "{{platform === 'darwin'}}",
      method: "shell.run",
      params: {
        message: "conda install -y -c conda-forge sox"
      },
      next: null
    },
    {
      when: "{{which('winget')}}",
      method: "shell.run",
      params: {
        sudo: true,
        message: "winget install --id=ChrisBagwell.SoX -e --silent --accept-source-agreements --accept-package-agreements --force --disable-interactivity"
      }
    }
  ]
}
