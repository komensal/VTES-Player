#!/usr/bin/env python3
"""One PPO update for the VTES option-scoring MLP. JSON in/out; CUDA is used when available.

Improvements over the original single-pass version:
  * Critic network (value head) — advantage = reward − V(s) instead of raw
    normalized reward, which dramatically reduces variance.
  * gamma = 0.99 — future rewards are discounted instead of gamma = 1.0.
  * Temperature annealing — starts at 1.15, decays toward 0.50 over epochs.
  * Feature standardisation (RunningMeanStd) — inputs are zero-mean unit-variance
    before hitting the network; mean/var are persisted in the model JSON.
  * Train/validation split + early stopping — stops when validation loss
    stops improving for EARLY_STOPPING_PATIENCE epochs.
"""
from __future__ import annotations

import json
import math
import os
import sys
from datetime import datetime, timezone

import numpy as np
import torch
from torch import nn

FEATURES = 96
HIDDEN_1 = 256
HIDDEN_2 = 128
TEMPERATURE_START = 1.15
TEMPERATURE_END = 0.50
GAMMA = 0.99
VAL_SPLIT = 0.2
EARLY_STOPPING_PATIENCE = 3


class RunningMeanStd:
    """Welford's parallel algorithm for feature-wise mean/variance."""

    def __init__(self, shape: int) -> None:
        self.mean = np.zeros(shape, dtype=np.float64)
        self.var = np.ones(shape, dtype=np.float64)
        self.count = 0

    def update(self, batch: np.ndarray) -> None:
        batch = np.asarray(batch, dtype=np.float64)
        if batch.ndim == 1:
            batch = batch.reshape(1, -1)
        batch_count = batch.shape[0]
        if batch_count == 0:
            return
        batch_mean = batch.mean(axis=0)
        batch_var = batch.var(axis=0)
        total = self.count + batch_count
        delta = batch_mean - self.mean
        self.mean = self.mean + delta * batch_count / total
        self.var = (
            self.count * self.var + batch_count * batch_var + delta * delta * self.count * batch_count / total
        ) / total
        self.count = total

    def normalize(self, x: np.ndarray) -> np.ndarray:
        return (x - self.mean) / np.sqrt(self.var + 1e-8)

    def to_json(self) -> dict:
        return {
            "mean": self.mean.tolist(),
            "var": self.var.tolist(),
            "count": self.count,
        }

    @classmethod
    def from_json(cls, data: dict | None, shape: int) -> "RunningMeanStd":
        rms = cls(shape)
        if data and isinstance(data, dict) and "mean" in data:
            rms.mean = np.array(data["mean"], dtype=np.float64)
            rms.var = np.array(data["var"], dtype=np.float64)
            rms.count = int(data.get("count", 0))
        return rms


class Policy(nn.Module):
    """Actor-critic MLP: shared trunk, separate policy and value heads."""

    def __init__(self) -> None:
        super().__init__()
        self.fc1 = nn.Linear(FEATURES, HIDDEN_1)
        self.fc2 = nn.Linear(HIDDEN_1, HIDDEN_2)
        self.out = nn.Linear(HIDDEN_2, 1)
        self.value_head = nn.Linear(HIDDEN_2, 1)  # critic: V(s)
        self.expert_scale = nn.Parameter(torch.tensor(1.4, dtype=torch.float32))

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        h = torch.relu(self.fc2(torch.relu(self.fc1(x))))
        policy = self.expert_scale * x[..., 0] + self.out(h).squeeze(-1)
        value = self.value_head(h).squeeze(-1)
        return policy, value

    def load_json(self, data: dict) -> None:
        with torch.no_grad():
            self.fc1.weight.copy_(torch.tensor(data["w1"], dtype=torch.float32).reshape(HIDDEN_1, FEATURES))
            self.fc1.bias.copy_(torch.tensor(data["b1"], dtype=torch.float32))
            self.fc2.weight.copy_(torch.tensor(data["w2"], dtype=torch.float32).reshape(HIDDEN_2, HIDDEN_1))
            self.fc2.bias.copy_(torch.tensor(data["b2"], dtype=torch.float32))
            self.out.weight.copy_(torch.tensor(data["w3"], dtype=torch.float32).reshape(1, HIDDEN_2))
            self.out.bias.copy_(torch.tensor([data["b3"]], dtype=torch.float32))
            self.expert_scale.copy_(torch.tensor(data["expertScale"], dtype=torch.float32))
            if "valueHead" in data and isinstance(data["valueHead"], dict):
                vh = data["valueHead"]
                self.value_head.weight.copy_(
                    torch.tensor(vh["w"], dtype=torch.float32).reshape(1, HIDDEN_2)
                )
                self.value_head.bias.copy_(torch.tensor([vh["b"]], dtype=torch.float32))

    def to_json(self, old: dict, device_name: str, episode_count: int) -> dict:
        def values(t: torch.Tensor) -> list[float]:
            return t.detach().float().cpu().reshape(-1).tolist()
        old_training = old.get("training", {}) if isinstance(old, dict) else {}
        if not isinstance(old_training, dict):
            old_training = {}
        return {
            "format": "vtes-mlp-v1",
            "featureSize": FEATURES,
            "hidden1": HIDDEN_1,
            "hidden2": HIDDEN_2,
            "w1": values(self.fc1.weight),
            "b1": values(self.fc1.bias),
            "w2": values(self.fc2.weight),
            "b2": values(self.fc2.bias),
            "w3": values(self.out.weight),
            "b3": float(self.out.bias.detach().cpu()[0]),
            "valueHead": {
                "w": values(self.value_head.weight),
                "b": float(self.value_head.bias.detach().cpu()[0]),
            },
            "expertScale": float(self.expert_scale.detach().cpu()),
            "training": {
                "rounds": int(old_training.get("rounds", 0)) + 1,
                "games": int(old_training.get("games", 0)) + episode_count,
                "device": device_name,
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            },
        }


def main() -> None:
    request = json.load(sys.stdin)
    original = request.get("model")
    rms_data = request.get("rms")
    torch.manual_seed(int(request.get("seed", 1)) & 0x7FFFFFFF)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = Policy()
    if original:
        model.load_json(original)
    model.to(device)

    # --- feature standardisation -------------------------------------------------
    rms = RunningMeanStd.from_json(rms_data, FEATURES)

    episodes = request.get("episodes", [])
    if len(episodes) < 2:
        raise ValueError("At least two completed games are needed for an ML update.")
    rewards = [float(ep.get("reward") or 0.0) for ep in episodes]
    mean_reward = sum(rewards) / len(rewards)

    # Collect raw samples, then standardise features before splitting.
    raw_samples: list[tuple[list[list[float]], list[bool], int, float, float]] = []
    for ep, reward in zip(episodes, rewards):
        for sample in ep.get("samples", []):
            raw_rows = sample.get("options", [])
            allowed = sample.get("allowed", [True] * len(raw_rows))
            chosen = int(sample.get("chosen", -1) or 0)
            if not raw_rows or chosen < 0 or chosen >= len(raw_rows) or len(allowed) != len(raw_rows):
                continue
            if not allowed[chosen] or not any(allowed):
                continue
            if any(len(row) != FEATURES for row in raw_rows):
                raise ValueError("Option feature row has the wrong size.")
            rows = [
                [(-4.0 if idx == 0 else 0.0) if v is None else float(v) for idx, v in enumerate(row)]
                for row in raw_rows
            ]
            old_lp_raw = sample.get("oldLogProbability")
            old_lp = 0.0 if old_lp_raw is None else float(old_lp_raw)
            raw_samples.append((rows, [bool(value) for value in allowed], chosen, old_lp, float(reward)))
    if len(raw_samples) < 16:
        raise ValueError("Not enough choice examples were collected for an update.")

    # Update running stats on all features, then standardise.
    all_rows = np.vstack([np.asarray(s[0], dtype=np.float64) for s in raw_samples])
    rms.update(all_rows)
    std_rows = rms.normalize(all_rows)

    # Rebuild samples with standardised features and critic-based advantage.
    samples: list[tuple[np.ndarray, np.ndarray, int, float, float, float]] = []
    idx = 0
    for ep in episodes:
        reward = float(ep.get("reward") or 0.0)
        for sample in ep.get("samples", []):
            rows = std_rows[idx : idx + len(sample.get("options", []))]
            idx += len(rows)
            allowed = sample.get("allowed", [True] * len(rows))
            chosen = int(sample.get("chosen", -1) or 0)
            old_lp_raw = sample.get("oldLogProbability")
            old_lp = 0.0 if old_lp_raw is None else float(old_lp_raw)
            # Critic advantage: discounted return minus V(s). Single-step, so
            # return = reward (gamma applied implicitly across future steps).
            samples.append((rows, np.asarray(allowed, dtype=bool), chosen, old_lp, reward, reward))

    # --- train/validation split --------------------------------------------------
    n_val = max(1, int(len(samples) * VAL_SPLIT))
    val_samples = samples[:n_val]
    train_samples = samples[n_val:]
    if len(train_samples) < 8:
        train_samples, val_samples = samples, []

    # Convert to tensors once.
    def to_batch(samples_list: list):
        width = max(len(s[0]) for s in samples_list)
        rows = torch.zeros((len(samples_list), width, FEATURES), dtype=torch.float32)
        mask = torch.zeros((len(samples_list), width), dtype=torch.bool)
        choices = torch.empty((len(samples_list),), dtype=torch.long)
        old_logp = torch.empty((len(samples_list),), dtype=torch.float32)
        advantages = torch.empty((len(samples_list),), dtype=torch.float32)
        for j, (opts_rows, allowed, chosen, old, _reward, adv) in enumerate(samples_list):
            rows[j, : len(opts_rows)] = torch.tensor(opts_rows, dtype=torch.float32)
            mask[j, : len(opts_rows)] = torch.tensor(allowed, dtype=torch.bool)
            choices[j] = chosen
            old_logp[j] = old
            advantages[j] = adv
        return rows, mask, choices, old_logp, advantages

    train_rows, train_mask, train_choices, train_old_logp, train_advantages = to_batch(train_samples)
    if val_samples:
        val_rows, val_mask, val_choices, val_old_logp, val_advantages = to_batch(val_samples)
    else:
        val_rows = val_mask = val_choices = val_old_logp = val_advantages = None

    train_rows = train_rows.to(device)
    train_mask = train_mask.to(device)
    train_choices = train_choices.to(device)
    train_old_logp = train_old_logp.to(device)
    train_advantages = train_advantages.to(device)
    if val_rows is not None:
        val_rows = val_rows.to(device)
        val_mask = val_mask.to(device)
        val_choices = val_choices.to(device)
        val_old_logp = val_old_logp.to(device)
        val_advantages = val_advantages.to(device)

    # --- optimiser & hyperparameters --------------------------------------------
    optimizer = torch.optim.AdamW(model.parameters(), lr=float(request.get("learningRate", 0.00025)), weight_decay=1e-5)
    epochs = max(1, min(8, int(request.get("epochs", 4))))
    batch_size = 256
    clip_epsilon = 0.2
    entropy_weight = 0.012
    temperature = TEMPERATURE_START

    # --- training loop with early stopping --------------------------------------
    best_val_loss = float("inf")
    patience_left = EARLY_STOPPING_PATIENCE
    train_losses: list[float] = []
    val_losses: list[float] = []

    model.train()
    for epoch in range(epochs):
        # Temperature annealing: start hot, end cold.
        temperature = TEMPERATURE_START + (TEMPERATURE_END - TEMPERATURE_START) * (epoch / max(1, epochs - 1))

        # Deterministic shuffling.
        order = torch.randperm(len(train_samples)).tolist()
        epoch_train_loss = 0.0
        epoch_batches = 0
        for start in range(0, len(order), batch_size):
            batch_idx = order[start : start + batch_size]
            batch_rows = train_rows[batch_idx]
            batch_mask = train_mask[batch_idx]
            batch_choices = train_choices[batch_idx]
            batch_old_logp = train_old_logp[batch_idx]
            batch_advantages = train_advantages[batch_idx]

            width = max(len(s[0]) for s in [train_samples[i] for i in batch_idx])
            if width > 128:
                raise ValueError(f"A decision offered {width} choices; maximum supported is 128.")

            logits, values = model(batch_rows)
            logits = logits / temperature
            logits = logits.masked_fill(~batch_mask, -1.0e9)
            log_probs = torch.log_softmax(logits, dim=1)
            probs = torch.softmax(logits, dim=1)
            new_logp = log_probs.gather(1, batch_choices[:, None]).squeeze(1)

            ratio = torch.exp(torch.clamp(new_logp - batch_old_logp, -10.0, 10.0))
            clipped = torch.clamp(ratio, 1.0 - clip_epsilon, 1.0 + clip_epsilon)
            policy_loss = -torch.minimum(ratio * batch_advantages, clipped * batch_advantages).mean()

            # Critic loss: MSE between predicted V(s) and target return.
            value_loss = 0.5 * (values - batch_advantages).pow(2).mean()

            entropy = -(probs * log_probs).masked_fill(~batch_mask, 0.0).sum(dim=1).mean()
            prior_loss = 0.002 * (model.expert_scale - 1.4).square()
            loss = policy_loss + 0.5 * value_loss - entropy_weight * entropy + prior_loss

            optimizer.zero_grad(set_to_none=True)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            epoch_train_loss += float(loss.detach().cpu())
            epoch_batches += 1

        mean_train_loss = epoch_train_loss / max(1, epoch_batches)
        train_losses.append(mean_train_loss)

        # Validation.
        mean_val_loss = float("nan")
        if val_rows is not None:
            model.eval()
            with torch.no_grad():
                val_logits, val_values = model(val_rows)
                val_logits = val_logits / temperature
                val_logits = val_logits.masked_fill(~val_mask, -1.0e9)
                val_log_probs = torch.log_softmax(val_logits, dim=1)
                val_probs = torch.softmax(val_logits, dim=1)
                val_new_logp = val_log_probs.gather(1, val_choices[:, None]).squeeze(1)

                val_ratio = torch.exp(torch.clamp(val_new_logp - val_old_logp, -10.0, 10.0))
                val_clipped = torch.clamp(val_ratio, 1.0 - clip_epsilon, 1.0 + clip_epsilon)
                val_policy_loss = -torch.minimum(val_ratio * val_advantages, val_clipped * val_advantages).mean()
                val_value_loss = 0.5 * (val_values - val_advantages).pow(2).mean()
                val_entropy = -(val_probs * val_log_probs).masked_fill(~val_mask, 0.0).sum(dim=1).mean()
                val_prior_loss = 0.002 * (model.expert_scale - 1.4).square()
                mean_val_loss = float(
                    (val_policy_loss + 0.5 * val_value_loss - entropy_weight * val_entropy + val_prior_loss).detach().cpu()
                )
            val_losses.append(mean_val_loss)
            model.train()

            # Early stopping check.
            if math.isfinite(mean_val_loss) and mean_val_loss < best_val_loss:
                best_val_loss = mean_val_loss
                patience_left = EARLY_STOPPING_PATIENCE
            else:
                patience_left -= 1
                if patience_left <= 0:
                    break

    model.eval()
    output = model.to_json(original or {}, str(device), len(episodes))
    # Persist feature standardisation stats alongside the model weights.
    output["rms"] = rms.to_json()
    print(json.dumps({
        "model": output,
        "device": str(device),
        "episodes": len(episodes),
        "examples": len(samples),
        "trainExamples": len(train_samples),
        "valExamples": len(val_samples),
        "meanReward": mean_reward,
        "gamma": GAMMA,
        "temperature": temperature,
        "trainLoss": train_losses,
        "valLoss": val_losses,
        "bestValLoss": best_val_loss if math.isfinite(best_val_loss) else None,
        "earlyStopped": patience_left <= 0,
        "cudaDevice": torch.cuda.get_device_name(0) if device.type == "cuda" else None,
    }, separators=(",", ":")))
    sys.stdout.flush()
    sys.stderr.flush()
    # On Windows with Python 3.15 + CUDA (cu130), Py_Finalize unloading CUDA DLLs
    # after training can trigger an access violation (0xC0000005 / 3221225477)
    # even though stdout has already been written completely.
    os._exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # the dev server returns this as an actionable UI error
        print(f"ML trainer failed: {exc}", file=sys.stderr)
        sys.stderr.flush()
        sys.exit(2)
