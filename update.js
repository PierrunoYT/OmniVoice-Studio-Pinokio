module.exports = {
  // `uv` comes from the AI bundle, and the editable reinstall below needs it.
  requires: {
    bundle: "ai"
  },
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
      when: "{{exists('app/.git')}}",
      method: "shell.run",
      params: {
        path: "app",
        message: "git pull",
      },
    },
    // Update MOSS-TTS-Nano
    {
      when: "{{exists('app/TTS-Engines/MOSS-TTS-Nano/.git')}}",
      method: "shell.run",
      params: {
        path: "app/TTS-Engines/MOSS-TTS-Nano",
        message: "git pull",
      },
    },
    // Re-run editable install to pick up any upstream MOSS-TTS-Nano changes
    {
      when: "{{exists('app/TTS-Engines/MOSS-TTS-Nano')}}",
      method: "shell.run",
      params: {
        venv: "../../.venv",
        path: "app/TTS-Engines/MOSS-TTS-Nano",
        message: "uv pip install -e . --no-deps",
      },
    },
    // Update CosyVoice
    {
      when: "{{exists('app/TTS-Engines/CosyVoice/.git')}}",
      method: "shell.run",
      params: {
        path: "app/TTS-Engines/CosyVoice",
        message: "git pull",
      },
    },
    // Update CosyVoice submodules
    {
      when: "{{exists('app/TTS-Engines/CosyVoice/.git')}}",
      method: "shell.run",
      params: {
        path: "app/TTS-Engines/CosyVoice",
        message: "git submodule update --init --recursive",
      },
    },
    // Update GPT-SoVITS
    {
      when: "{{exists('app/TTS-Engines/GPT-SoVITS/.git')}}",
      method: "shell.run",
      params: {
        path: "app/TTS-Engines/GPT-SoVITS",
        message: "git pull",
      },
    }
  ]
}
