import { describe, expect, it } from "vitest";
import type { CombatFrame, GameState, MinionState, PermanentInPlay } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

// Ammunition's damage bonus is PART of the strike, not a separate packet with
// ambiguous provenance: Rego Motum (prevention "from the opposing minion's
// strike") must cover the merged amount.

function find(state: GameState, id: string): MinionState {
  const m = state.seats.flatMap((s) => s.minions).find((x) => x.id === id);
  if (!m) throw new Error(`no minion ${id}`);
  return m;
}
function combat(state: GameState): CombatFrame | undefined {
  const f = state.frames.find((x) => x.kind === "combat");
  return f?.kind === "combat" ? f : undefined;
}
function equip(state: GameState, minion: string, id: string, name: string): PermanentInPlay {
  const h = testRegistry[name];
  const p: PermanentInPlay = {
    card: { id, name }, locked: false, usedThisPhase: false,
    statics: h?.permanentStatics ?? {}, tags: h?.permanentTags ?? [],
  };
  find(state, minion).attached.push(p);
  return p;
}

function setup() {
  const state = threeSeatGame();
  Object.assign(find(state, "V1"), { blood: 5, strength: 1 });
  Object.assign(find(state, "M"), { blood: 8, strength: 1, disciplines: { tha: "superior" } });
  equip(state, "V1", "gun1", ".44 Magnum");
  state.seats[0]!.hand.push({ id: "am1", name: "Scattershot" });
  state.seats[1]!.hand.push({ id: "rm", name: "Rego Motum" });
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
  return { state, engine };
}

describe("ammunition is part of the strike (prevention provenance)", () => {
  it("Rego Motum covers the gun strike WITH the ammo bonus merged in", () => {
    const { state, engine } = setup();
    // Load Scattershot (close-range damage bonus) before the gun strike resolves.
    let loaded = false;
    let struck = false;
    let prevented = false;
    for (let i = 0; i < 120; i++) {
      const cf = combat(state);
      if (!cf) break;
      const dp = engine.decision()!;
      const ids = dp.options.map((o) => o.id);
      const ammo = ids.find((o) => o.startsWith("play:Scattershot"));
      const gun = ids.find((o) => o.startsWith("ability:") && o.endsWith(":strike"));
      const rego = ids.find((o) => o.startsWith("play:Rego Motum"));
      if (ammo && !loaded) { loaded = true; engine.choose(ammo); continue; }
      if (gun && !struck) { struck = true; engine.choose(gun); continue; }
      if (rego && !prevented) {
        prevented = true;
        // The packet being prevented carries the strike's provenance.
        const pd = cf.pendingDamage[0]!;
        expect(pd.fromStrike).toBe(true);
        expect(pd.strikePhase).toBeDefined();
        engine.choose(rego);
        continue;
      }
      engine.choose((dp.options.find((o) => o.id === "pass") ?? dp.options[0]!).id);
    }
    expect(loaded).toBe(true);
    expect(struck).toBe(true);
    expect(prevented).toBe(true);
  });
});
