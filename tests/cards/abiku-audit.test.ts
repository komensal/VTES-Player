import { describe, expect, it } from "vitest";
import { VtesEngine, currentStealth } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { testRegistry } from "../engine/fixtures.ts";

function table() {
  const deck = (seat: string, id: number): SnapshotDeck => ({
    seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 0 }],
    crypt: [{ id }], library: [], pool: 20,
  });
  const state = buildGame({ decks: [deck("Alice", 200008), deck("Bob", 200067), deck("Carol", 200132)], seed: 1, maxTurns: 40 });
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("no turn");
  turn.phase = "minion";
  turn.unlockDone = true;
  turn.edgeDone = true;
  turn.unlockAbilitiesDone = true;
  const abiku = state.seats[0]!.minions[0]!;
  abiku.blood = 2;
  abiku.locked = false;
  return { state, abiku, engine: new VtesEngine(state, testRegistry) };
}
function stealth(state: ReturnType<typeof table>["state"]) {
  const f = state.frames.find((x) => x.kind === "action");
  if (!f || f.kind !== "action") throw new Error("no action");
  return currentStealth(state, f.actionId);
}
describe("Abiku (G4)", () => {
  it("imports the ability in ready, uncontrolled and crypt zones", () => {
    const { state } = table();
    const seat = state.seats[0]!;
    for (const m of [seat.minions[0]!, seat.uncontrolled[0]!.card, seat.crypt[0]!]) {
      expect(m.attached.find((p) => p.card.id === m.id)?.statics.conditional).toEqual([{ stealth: 1, actionKinds: ["hunt"] }]);
    }
  });
  it("has +1 stealth for a normal hunt, but not for a bleed", () => {
    const hunt = table();
    hunt.engine.choose(`hunt:${hunt.abiku.id}`);
    expect(stealth(hunt.state)).toBe(2);
    const bleed = table();
    bleed.engine.choose(`bleed:${bleed.abiku.id}`);
    expect(stealth(bleed.state)).toBe(0);
  });
  it("gets the same bonus on the special hunt Abactor", () => {
    const { state, abiku, engine } = table();
    state.seats[0]!.hand.push({ id: "ab", name: "Abactor" });
    const option = engine.decision()!.options.find((o) => o.id.startsWith("play:Abactor:"));
    expect(option).toBeDefined();
    engine.choose(option!.id);
    for (let i = 0; i < 8 && !state.frames.some((f) => f.kind === "action"); i++) engine.choose("pass");
    expect(state.frames.some((f) => f.kind === "action" && f.acting === abiku.id && f.actionKind === "hunt")).toBe(true);
    expect(stealth(state)).toBe(2);
  });
});
