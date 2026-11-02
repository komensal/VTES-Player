# Local neural-agent training

AI Training Lab now has two distinct paths:

- **Heuristic tuning** evolves the existing hand-authored weights in the browser.
- **Neural training** runs real five-player games in the browser engine, then applies a local PyTorch PPO update to a residual MLP policy with 96 public features and 256/128 hidden layers, large enough to learn cross-feature interactions while remaining inexpensive for synchronous browser inference. The model is saved in browser local storage and runs in ordinary games without Python; Python/PyTorch is only required to train or continue training it.

The neural policy sees the same masked `PlayerView` and legal options as any other agent. The training process receives encoded decision features and final rewards, never a `GameState`, another seat's hand, or face-down library contents. Browser inference and Python training share the fixed `vtes-mlp-v1` feature and weight layout in `src/ai/ml-agent.ts` and `scripts/train_ml.py`.

## Python / CUDA setup

Create a local Python environment and install a CUDA-enabled PyTorch wheel compatible with the installed NVIDIA driver. Use the command from the official PyTorch install selector for **Windows / Pip / CUDA** (or Linux, as appropriate); do not install a CPU-only wheel if you want the RTX 3070 to train the network.

Example Windows PowerShell flow (replace the wheel index with the one selected for your driver/PyTorch version if needed):

```powershell
py -3 -m venv .venv-ml
.\.venv-ml\Scripts\python.exe -m pip install --upgrade pip
.\.venv-ml\Scripts\python.exe -m pip install torch --index-url https://download.pytorch.org/whl/cu128
$env:VTES_PYTHON = "$PWD\.venv-ml\Scripts\python.exe"
.\Play VTES.bat
```

Example Linux flow:

```bash
python3 -m venv .venv-ml
.venv-ml/bin/python -m pip install --upgrade pip
.venv-ml/bin/python -m pip install torch --index-url https://download.pytorch.org/whl/cu128
export VTES_PYTHON="$PWD/.venv-ml/bin/python"
npm run play
```

If the selected official PyTorch command uses a different CUDA wheel index, use that instead of `cu128`. Confirm CUDA before opening the app:

```bash
python -c "import torch; print(torch.__version__, torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

When `VTES_PYTHON` is unset, the dev server tries `python` on Windows and `python3` elsewhere. If CUDA PyTorch is not installed, training can still run on CPU and the panel reports the actual backend. A normal production/static build has no Python endpoint. Train and play from the same local Vite app: the saved model is stored in that browser origin's local storage and can be selected under **Settings → Bots**. Local storage does not move automatically between `localhost`, Arena preview, and a published site; use the same origin where you trained.

## Training behavior

Each update round uses seeded five-seat games. The candidate rotates seats against four changing styles drawn from Balanced, Bruiser, Stalker, Turtle, Politician, and Builder. A round ends with a PPO update; successful round models are saved immediately. UI scores include candidate mean VP, opponents' mean VP, wins, ousts, and the chosen backend. Cancellation takes effect at a game/round boundary, not halfway through engine resolution.
