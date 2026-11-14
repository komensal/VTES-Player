import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import type { GameState, MinionState } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function table(blood: number, howler = false): { state: GameState; actor: MinionState; engine: VtesEngine } {
  const state = threeSeatGame();
  const actor = state.seats[0]!.minions[0]!;
  Object.assign(actor, { blood, clan: "Hecata" });
  if (howler) {
    const self = testRegistry["Howler (G2)"]!.cryptEntry!();
    actor.attached.push({ card: { id: actor.id, name: "Howler (G2)" }, locked: false,
      usedThisPhase: false, statics: self.statics, tags: self.tags });
  }
  const chainsaw = testRegistry["Talbot's Chainsaw"]!;
  actor.attached.push({ card: { id: "saw", name: "Talbot's Chainsaw" }, owner: "Alice",
    controller: "Alice", locked: false, usedThisPhase: false,
    statics: chainsaw.permanentStatics ?? {}, tags: chainsaw.permanentTags ?? [] });
  state.seats[0]!.hand.push({ id: "psy", name: "Psychophagia" });
  state.seats[0]!.ashHeap = [{ id: "dead-ally", name: "Political Ally" }];
  state.seats[0]!.minions.push(makeMinion("V2", "Alice", { clan: "Hecata", blood: 3 }));
  return { state, actor, engine: new VtesEngine(state, testRegistry) };
}

const ids = (engine: VtesEngine) => engine.decision()!.options.map((o) => o.id);

describe("Talbot's Chainsaw hunt restriction", () => {
  it("bars both the normal hunt and a hunt action card only for the bearer", () => {
    const { engine } = table(3);
    const options = ids(engine);
    expect(options).not.toContain("hunt:V1");
    expect(options.some((id) => id.startsWith("play:Psychophagia:") && id.includes(":V1:"))).toBe(false);
    expect(options).toContain("bleed:V1");
    expect(options).toContain("hunt:V2");
    expect(options.some((id) => id.startsWith("play:Psychophagia:") && id.includes(":V2:"))).toBe(true);
  });

  it("leaves a bloodless bearer stuck without preventing others from acting", () => {
    const { engine } = table(0);
    const options = engine.decision()!.options;
    expect(options.filter((o) => "minion" in o && o.minion === "V1")).toEqual([]);
    expect(options.map((o) => o.id)).toContain("bleed:V2");
    expect(options.map((o) => o.id)).toContain("end");
  });

  it.each([0, 3])("Howler may hunt with the weapon, including at %i blood", (blood) => {
    const { engine } = table(blood, true);
    const options = ids(engine);
    expect(options).toContain("hunt:V1");
    expect(options.some((id) => id.startsWith("play:Psychophagia:") && id.includes(":V1:"))).toBe(true);
  });

  it("lets a bloodless Howler actually resolve her hunt", () => {
    const { state, actor, engine } = table(0, true);
    runTrace(engine, [
      ["Alice", "hunt:V1"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    expect(actor.blood).toBe(1);
    expect(actor.locked).toBe(true);
    expect(state.eventLog.some((e) => e.type === "ActionResolved" && e.success)).toBe(true);
  });

  it.each([0, 3])("bars a granted hunt at %i blood without barring Howler", (blood) => {
    for (const howler of [false, true]) {
      const { state, actor, engine } = table(blood, howler);
      actor.clan = "Ravnos";
      state.seats[1]!.minions[0]!.clan = "Ravnos";
      state.seats[0]!.permanents.push({ card: { id: "won", name: "Week of Nightmares" },
        controller: "Alice", locked: false, usedThisPhase: false, statics: {}, counters: 10,
        tags: ["Week of Nightmares"], aura: { scope: "global", clan: "Ravnos", cannotHunt: true } });
      const options = ids(engine);
      expect(options.some((id) => id.startsWith("act:Week of Nightmares:won:steal:V1:"))).toBe(howler);
    }
  });

  it("bars the Restricted Vitae mandatory hunt when the bearer is bloodless", () => {
    const { state, engine } = table(0);
    state.seats[0]!.permanents.push({ card: { id: "rv", name: "Restricted Vitae" }, locked: false,
      usedThisPhase: false, statics: { huntingRestricted: true }, tags: ["event", "gehenna"] });
    const options = ids(engine);
    expect(options.some((id) => id.startsWith("hunt:V1"))).toBe(false);
    expect(options).toContain("bleed:V2");
  });

  it("allows the bearer to hunt again immediately when the weapon leaves play", () => {
    const { state, engine } = table(3);
    expect(ids(engine)).not.toContain("hunt:V1");
    engine.burnPermanent("saw");
    expect(ids(engine)).toContain("hunt:V1");
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "saw")).toBe(true);
  });
});
