import { describe, expect, it } from "vitest";
import type { CombatFrame, GameState, MinionState, PermanentInPlay } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

// LSJ 20001206: "Resolve the pending additional strikes before gaining any
// further additional strikes." A pending additional strike (here: the AK-47's
// optional grant) must resolve BEFORE the grant window offers another source
// (superior Quickness, which is not limited).

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
  Object.assign(find(state, "V1"), { blood: 10, strength: 1, capacity: 10, disciplines: { cel: "superior" } });
  Object.assign(find(state, "M"), { blood: 10, strength: 1 });
  equip(state, "V1", "ak", "AK-47");
  state.seats[0]!.hand.push({ id: "q1", name: "Quickness" });
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
  return { state, engine };
}

describe("AK-47 + superior Quickness ordering [LSJ 20001206]", () => {
  it("does NOT offer Quickness while the AK-47 additional strike is still pending", () => {
    const { state, engine } = setup();
    let quicknessOfferedWhilePending = false;
    let struckWithAk = false;
    for (let i = 0; i < 200; i++) {
      const cf = combat(state);
      if (!cf) break;
      const dp = engine.decision();
      if (!dp) break;
      const quick = dp.options.find((o) => o.id.startsWith("play:Quickness"));
      const akStrike = dp.options.find((o) => o.id === "ability:AK-47:ak:strike");
      if (quick && cf.additionalStrikes.acting > 0) quicknessOfferedWhilePending = true;
      if (akStrike && !struckWithAk) {
        struckWithAk = true;
        engine.choose("ability:AK-47:ak:strike");
        continue;
      }
      const pick = dp.options.find((o) => o.id === "pass") ?? dp.options[0]!;
      engine.choose(pick.id);
    }
    expect(struckWithAk).toBe(true);
    expect(quicknessOfferedWhilePending).toBe(false);
  });

  it("resolves the pending AK-47 strike BEFORE the grant window offers Quickness", () => {
    const { state, engine } = setup();
    const order: string[] = [];
    let struckWithAk = false;
    for (let i = 0; i < 200; i++) {
      const cf = combat(state);
      if (!cf) break;
      const dp = engine.decision();
      if (!dp) break;
      const quick = dp.options.find((o) => o.id.startsWith("play:Quickness"));
      const akStrike = dp.options.find((o) => o.id === "ability:AK-47:ak:strike");
      if (quick) order.push(`grant(addl=${cf.additionalStrikes.acting})`);
      if (akStrike && cf.strikeRound === "additional") order.push("ak47-additional-strike");
      if (akStrike && !struckWithAk) {
        struckWithAk = true;
        engine.choose("ability:AK-47:ak:strike");
        continue;
      }
      const pick = dp.options.find((o) => o.id === "pass") ?? dp.options[0]!;
      engine.choose(pick.id);
    }
    // The AK-47's additional strike resolves in its own sub-round first;
    // the grant window with Quickness opens only after it (addl already 0).
    const additionalIdx = order.indexOf("ak47-additional-strike");
    const grantIdx = order.findIndex((s) => s.startsWith("grant"));
    expect(additionalIdx).toBeGreaterThanOrEqual(0);
    expect(grantIdx).toBeGreaterThan(additionalIdx);
    expect(order[grantIdx]).toBe("grant(addl=0)");
  });
});

