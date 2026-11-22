import { describe, expect, it } from "vitest";
import type { GameState, MinionState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function find(state: GameState, id: string): MinionState {
  const m = state.seats.flatMap((s) => s.minions).find((x) => x.id === id);
  if (!m) throw new Error(`no minion ${id}`);
  return m;
}

function setup(blocked: boolean = false) {
  const state = threeSeatGame();
  const gostoso = find(state, "V1"); // Alice's minion, her prey is Bob
  Object.assign(gostoso, { name: "Gostoso (G6)", blood: 4, capacity: 6 });
  const self = testRegistry["Gostoso (G6)"]!.cryptEntry!();
  gostoso.attached.push({ card: { id: "gost", name: "Gostoso (G6)" }, locked: false,
    usedThisPhase: false, statics: self.statics, tags: self.tags });
  state.seats[0]!.minions[0]!.blood = 4;
  const engine = new VtesEngine(state, testRegistry);
  const trace: [string, string][] = [["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]];
  if (blocked) {
    trace.splice(4, 0, ["Bob", "block:W"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]);
  }
  runTrace(engine, trace);
  return { state, gostoso, engine };
}

function toAfterResolution(e: VtesEngine) {
  for (let i = 0; i < 80; i++) {
    const dp = e.decision()!;
    const opt = dp.options.find((o: any) => o.id.includes("bleedSuccessBlood"));
    if (opt) return dp; // found the bleedSuccessBlood offer
    if (dp.window === "turn.minion") return dp; // ended without offer
    const pick = dp.options.find(o => o.id === "pass") ?? dp.options.find(o => o.id === "strike:hand");
    if (!pick) throw new Error(`no pass in ${dp.window}: ${dp.options.map(o => o.id)}`);
    e.choose(pick.id);
  }
  throw new Error("combat did not finish");
}

describe("Gostoso (G6)", () => {
  it("offers blood gain after a successful bleed of prey (1 or more)", () => {
    const { state, gostoso, engine } = setup();
    const dp = toAfterResolution(engine);
    expect(state.seats[1]!.pool).toBe(9); // prey Bob lost 1 pool
    const opt = dp.options.find((o: any) => o.id.includes("bleedSuccessBlood"));
    expect(opt).toBeDefined();
    expect(dp.seat).toBe("Alice");
  });

  it("gains 1 blood when the choice is accepted", () => {
    const { state, gostoso, engine } = setup();
    const dp = toAfterResolution(engine);
    const opt = dp.options.find((o: any) => o.id.includes("bleedSuccessBlood:yes"));
    expect(opt).toBeDefined();
    const before = gostoso.blood;
    engine.choose(opt!.id);
    expect(gostoso.blood).toBe(before + 1);
  });

  it("does not offer blood gain if the bleed was 0", () => {
    const { state, gostoso, engine } = setup();
    // Reduce bleed to 0 before resolution
    const af = state.frames.find(f => f.kind === "action")!;
    if (af.kind !== "action") throw new Error("no action");
    engine.emit({ type: "BleedAmountModified", actionId: af.actionId, delta: -1, source: "test", limited: false });
    const dp = toAfterResolution(engine);
    expect(dp.options.some((o: any) => o.id.includes("bleedSuccessBlood"))).toBe(false);
  });

});