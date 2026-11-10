#!/usr/bin/env python3
"""One PPO update for the VTES option-scoring MLP. JSON in/out; CUDA is used when available."""
from __future__ import annotations

import json
import math
import os
import sys
from datetime import datetime, timezone

import torch
from torch import nn

FEATURES = 96
HIDDEN_1 = 256
HIDDEN_2 = 128
TEMPERATURE = 1.15


class Policy(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.fc1 = nn.Linear(FEATURES, HIDDEN_1)
        self.fc2 = nn.Linear(HIDDEN_1, HIDDEN_2)
        self.out = nn.Linear(HIDDEN_2, 1)
        self.expert_scale = nn.Parameter(torch.tensor(1.4, dtype=torch.float32))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        residual = self.out(torch.relu(self.fc2(torch.relu(self.fc1(x))))).squeeze(-1)
        return self.expert_scale * x[..., 0] + residual

    def load_json(self, data: dict) -> None:
        with torch.no_grad():
            self.fc1.weight.copy_(torch.tensor(data["w1"], dtype=torch.float32).reshape(HIDDEN_1, FEATURES))
            self.fc1.bias.copy_(torch.tensor(data["b1"], dtype=torch.float32))
            self.fc2.weight.copy_(torch.tensor(data["w2"], dtype=torch.float32).reshape(HIDDEN_2, HIDDEN_1))
            self.fc2.bias.copy_(torch.tensor(data["b2"], dtype=torch.float32))
            self.out.weight.copy_(torch.tensor(data["w3"], dtype=torch.float32).reshape(1, HIDDEN_2))
            self.out.bias.copy_(torch.tensor([data["b3"]], dtype=torch.float32))
            self.expert_scale.copy_(torch.tensor(data["expertScale"], dtype=torch.float32))

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
    torch.manual_seed(int(request.get("seed", 1)) & 0x7FFFFFFF)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = Policy()
    if original:
        model.load_json(original)
    model.to(device)

    episodes = request.get("episodes", [])
    if len(episodes) < 2:
        raise ValueError("At least two completed games are needed for an ML update.")
    rewards = [float(ep.get("reward") or 0.0) for ep in episodes]
    mean_reward = sum(rewards) / len(rewards)
    variance = sum((r - mean_reward) ** 2 for r in rewards) / max(1, len(rewards) - 1)
    reward_sd = math.sqrt(variance)

    samples: list[tuple[list[list[float]], list[bool], int, float, float]] = []
    for ep, reward in zip(episodes, rewards):
        advantage = (
            max(-3.0, min(3.0, (reward - mean_reward) / (reward_sd + 1e-6)))
            if reward_sd >= 1e-6
            else max(-1.5, min(1.5, reward))
        )
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
            sample_adv = (
                advantage
                if reward_sd >= 1e-6
                else max(-3.0, min(3.0, advantage + 0.35 * float(rows[chosen][0])))
            )
            old_lp_raw = sample.get("oldLogProbability")
            old_lp = 0.0 if old_lp_raw is None else float(old_lp_raw)
            samples.append((rows, [bool(value) for value in allowed], chosen, old_lp, sample_adv))
    if len(samples) < 16:
        raise ValueError("Not enough choice examples were collected for an update.")

    optimizer = torch.optim.AdamW(model.parameters(), lr=float(request.get("learningRate", 0.00025)), weight_decay=1e-5)
    epochs = max(1, min(8, int(request.get("epochs", 4))))
    batch_size = 256
    clip_epsilon = 0.2
    entropy_weight = 0.012
    losses: list[float] = []
    model.train()

    for _ in range(epochs):
        # Deterministic shuffling, isolated from the game's RNG.
        order = torch.randperm(len(samples)).tolist()
        for start in range(0, len(order), batch_size):
            batch = [samples[i] for i in order[start:start + batch_size]]
            width = max(len(item[0]) for item in batch)
            if width > 128:
                raise ValueError(f"A decision offered {width} choices; maximum supported is 128.")
            rows = torch.zeros((len(batch), width, FEATURES), dtype=torch.float32)
            mask = torch.zeros((len(batch), width), dtype=torch.bool)
            choices = torch.empty((len(batch),), dtype=torch.long)
            old_logp = torch.empty((len(batch),), dtype=torch.float32)
            advantages = torch.empty((len(batch),), dtype=torch.float32)
            for j, (options, allowed, chosen, old, adv) in enumerate(batch):
                rows[j, :len(options)] = torch.tensor(options, dtype=torch.float32)
                mask[j, :len(options)] = torch.tensor(allowed, dtype=torch.bool)
                choices[j] = chosen
                old_logp[j] = old
                advantages[j] = adv
            rows = rows.to(device)
            mask = mask.to(device)
            choices = choices.to(device)
            old_logp = old_logp.to(device)
            advantages = advantages.to(device)

            logits = model(rows) / TEMPERATURE
            logits = logits.masked_fill(~mask, -1.0e9)
            log_probs = torch.log_softmax(logits, dim=1)
            probs = torch.softmax(logits, dim=1)
            new_logp = log_probs.gather(1, choices[:, None]).squeeze(1)
            ratio = torch.exp(torch.clamp(new_logp - old_logp, -10.0, 10.0))
            clipped = torch.clamp(ratio, 1.0 - clip_epsilon, 1.0 + clip_epsilon)
            policy_loss = -torch.minimum(ratio * advantages, clipped * advantages).mean()
            entropy = -(probs * log_probs).masked_fill(~mask, 0.0).sum(dim=1).mean()
            prior_loss = 0.002 * (model.expert_scale - 1.4).square()
            loss = policy_loss - entropy_weight * entropy + prior_loss

            optimizer.zero_grad(set_to_none=True)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            losses.append(float(loss.detach().cpu()))

    model.eval()
    output = model.to_json(original or {}, str(device), len(episodes))
    print(json.dumps({
        "model": output,
        "device": str(device),
        "episodes": len(episodes),
        "examples": len(samples),
        "meanReward": mean_reward,
        "rewardStd": reward_sd,
        "meanLoss": sum(losses) / max(1, len(losses)),
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
