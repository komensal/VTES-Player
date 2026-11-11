import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function table(card: string) {
  const state = threeSeatGame();
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("fixture");
  turn.phase = "master";
  turn.masterActionsLeft = 1;
  state.seats[0]!.hand.push({ id: "master-1", name: card });
  return { state, engine: new VtesEngine(state, testRegistry) };
}
const hasPlay = (engine: VtesEngine, card: string) => engine.decision()!.options.some((o) => o.kind === "playCard" && o.name === card);

describe("printed master clan and sect requirements", () => {
  for (const card of ["Backways", "Black Market Cache"]) {
    const clan = card === "Backways" ? "Gangrel" : "Ravnos";
    it(`${card}: requires a ready controlled ${clan}, including for bespoke handlers`, () => {
      const { state, engine } = table(card);
      const own = state.seats[0]!.minions[0]!;
      own.clan = "Ventrue";
      state.seats[1]!.minions[0]!.clan = clan;
      expect(hasPlay(engine, card)).toBe(false); // opponent does not count
      own.clan = clan;
      own.inTorpor = true;
      expect(hasPlay(engine, card)).toBe(false);
      own.inTorpor = false;
      own.locked = true; // locked is still ready
      expect(hasPlay(engine, card)).toBe(true);
      own.kind = "ally";
      expect(hasPlay(engine, card)).toBe(false);
    });
  }
  it("enforces clan alternatives and does not require both", () => {
    const { state, engine } = table("Ennoia's Theater");
    const own = state.seats[0]!.minions[0]!;
    own.clan = "Ventrue";
    expect(hasPlay(engine, "Ennoia's Theater")).toBe(false);
    own.clan = "Gangrel";
    expect(hasPlay(engine, "Ennoia's Theater")).toBe(true);
    own.clan = "Gangrel antitribu";
    expect(hasPlay(engine, "Ennoia's Theater")).toBe(true);
  });
  it("enforces the printed Anarch sect requirement independently", () => {
    const { state, engine } = table("Carfax Abbey");
    const own = state.seats[0]!.minions[0]!;
    own.sect = "camarilla";
    expect(hasPlay(engine, "Carfax Abbey")).toBe(false);
    own.sect = "anarch";
    expect(hasPlay(engine, "Carfax Abbey")).toBe(true);
  });
  for (const [card, sect] of [["Blood Turnip", "anarch"], ["Church of the Order of St. Blaise", "sabbat"], ["Flames of Insurrection", "anarch"], ["Powerbase: Luanda", "laibon"], ["Powerbase: Tshwane", "laibon"], ["Smear Campaign", "anarch"], ["Static Virtue", "laibon"]] as const) {
    it(`${card} requires a ready ${sect}`, () => {
      const { state, engine } = table(card);
      const own = state.seats[0]!.minions[0]!;
      own.sect = "camarilla";
      expect(hasPlay(engine, card)).toBe(false);
      own.sect = sect;
      expect(hasPlay(engine, card)).toBe(true);
      own.inTorpor = true;
      expect(hasPlay(engine, card)).toBe(false);
    });
  }
  it("requires the same ready Sabbat vampire to have capacity at least 5", () => {
    const { state, engine } = table("Toy Chest Test");
    const own = state.seats[0]!.minions[0]!;
    own.sect = "sabbat"; own.capacity = 4;
    state.seats[0]!.minions.push(makeMinion("V-cap", "Alice", { sect: "anarch", capacity: 9 }));
    expect(hasPlay(engine, "Toy Chest Test")).toBe(false);
    own.capacity = 5;
    expect(hasPlay(engine, "Toy Chest Test")).toBe(true);
  });
  it("does not add a clan restriction to a master without one", () => {
    const { state, engine } = table("Misdirection");
    state.seats[0]!.minions = [];
    expect(hasPlay(engine, "Misdirection")).toBe(true);
  });
  it("does not require the clan to remain present to use an in-play card", () => {
    const { state, engine } = table("Ennoia's Theater");
    state.seats[0]!.minions[0]!.clan = "Gangrel";
    const option = engine.decision()!.options.find((o) => o.kind === "playCard" && o.name === "Ennoia's Theater")!;
    engine.choose(option.id);
    for (let i = 0; i < 3; i++) engine.choose("pass");
    state.seats[0]!.minions[0]!.clan = "Ventrue";
    expect(engine.decision()!.options.some((o) => o.id.startsWith("ability:Ennoia's Theater"))).toBe(true);
  });
});
