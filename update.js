module.exports = {
  run: [
    // Update pinokio scripts 
    {
      method: "shell.run",
      params: {
        message: "git pull",
      },
    },
    // Update Omnivoice
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "git pull",
      },
    },
    // Update MOSS-TTS-Nano
    {
      method: "shell.run",
      params: {
        path: "app/TTS-Engines/MOSS-TTS-Nano",
        message: "git pull",
      },
    },
    // Re-run editable install to pick up any upstream MOSS-TTS-Nano changes
    {
      method: "shell.run",
      params: {
        venv: "../../.venv",
        path: "app/TTS-Engines/MOSS-TTS-Nano",
        message: "uv pip install -e . --no-deps",
      },
    },
    // Update CosyVoice
    {
      method: "shell.run",
      params: {
        path: "app/TTS-Engines/CosyVoice",
        message: "git pull",
      },
    },
    // Update CosyVoice submodules
    {
      method: "shell.run",
      params: {
        path: "app/TTS-Engines/CosyVoice",
        message: "git submodule update --init --recursive",
      },
    },
    // Update GPT-SoVITS
    {
      method: "shell.run",
      params: {
        path: "app/TTS-Engines/GPT-SoVITS",
        message: "git pull",
      },
    }
  ]
}
