import { describe, expect, it } from "vitest";
import { capacityOf, disciplinesOf, VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

const disciplines = [
  ["Mythercerer", "myt"],
  ["Obeah", "obe"],
  ["Valeren", "val"],
  ["Visceratika", "vis"],
  ["Daimaite", "dai"],
  ["Melpominee", "mel"],
  ["Spiritus", "spi"],
  ["Temporis", "tem"],
  ["Thanatosis", "thn"],
] as const;

describe.each(disciplines)("%s discipline master", (name, code) => {
  function game(level?: "basic" | "superior") {
    const state = threeSeatGame();
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("expected turn frame");
    turn.phase = "master";
    turn.masterActionsLeft = 1;
    const vampire = state.seats[0]!.minions[0]!;
    vampire.disciplines = level ? { [code]: level } : {};
    state.seats[0]!.hand = [{ id: "disc", name }];
    return { state, vampire, engine: new VtesEngine(state, testRegistry) };
  }

  it.each([undefined, "basic"] as const)("raises %s and capacity", (level) => {
    const { vampire, engine } = game(level);
    const oldCapacity = capacityOf(vampire);
    runTrace(engine, [
      ["Alice", `play:${name}:-:V1:disc`],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    expect(vampire.attached.some((p) => p.card.id === "disc")).toBe(true);
    expect(disciplinesOf(vampire)[code]).toBe(level === "basic" ? "superior" : "basic");
    expect(capacityOf(vampire)).toBe(oldCapacity + 1);
  });

  it("does not offer a target already at superior", () => {
    const { engine } = game("superior");
    expect(engine.decision()!.options.some((o) => o.id === `play:${name}:-:V1:disc`)).toBe(false);
  });
});
