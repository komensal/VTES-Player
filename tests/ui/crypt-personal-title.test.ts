import { describe, expect, it } from "vitest";
import registry from "../../src/cards/registry.json";
import { VtesEngine, TITLE_VOTES, titleContestKey, vampireVotes, prospectiveBleed } from "../../src/engine/index.ts";
import { importCryptCard, personalTitleFromText } from "../../src/ui/cardinfo.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { titleLabel } from "../../src/ui/render.ts";
import { testRegistry, runTrace } from "../engine/fixtures.ts";

// Reviewed printed personal titles, excluding Kemintiri's merged-only title.
const ids = [200068,200074,200104,200136,200149,200155,200167,200247,200316,200363,200450,200578,200630,200668,200742,200759,200773,200804,200811,200885,200891,200912,200955,200964,201006,201043,201044,201045,201160,201175,201253,201282,201327,201331,201365,201370,201413,201477,201502,201621,201654];
const deck = (seat: string, id: number): SnapshotDeck => ({
  seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 0 }],
  crypt: [{ id }], library: [], pool: 20,
});
function game(id: number) {
  const state = buildGame({ decks: [deck("Alice", id), deck("Bob", 200067), deck("Carol", 200132)], seed: 1, maxTurns: 40 });
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("missing turn");
  turn.phase = "minion";
  return state;
}

describe("printed personal titles", () => {
  it("imports exactly 41 unmerged titles in all crypt zones with the printed votes", () => {
    const crypt = Object.values(registry.entries).map((e) => e.card).filter((c) => c.kind === "crypt");
    const imported = crypt.filter((c) => importCryptCard(c.id).title?.startsWith("personal")).map((c) => c.id).sort((a, b) => a - b);
    expect(imported).toEqual(ids);
    for (const id of ids) {
      const card = importCryptCard(id);
      const match = /([12]) votes? \(titled\)/.exec(card.cardText.split("[MERGED]")[0]!);
      if (!card.title || !match) throw new Error(`bad fixture ${id}`);
      expect(TITLE_VOTES[card.title], `${id} votes`).toBe(Number(match[1]));
      const seat = game(id).seats[0]!;
      expect(seat.minions[0]!.title, `${id} ready`).toBe(card.title);
      expect(seat.uncontrolled[0]!.card.title, `${id} uncontrolled`).toBe(card.title);
      expect(seat.crypt[0]!.title, `${id} crypt`).toBe(card.title);
      expect(titleContestKey(seat.minions[0]!)).toBeNull();
    }
  });

  it("does not mistake another minion, vote bonuses, or merged-only text for a printed title", () => {
    expect(personalTitleFromText("Independent: Other has 2 votes (titled).", "Person (G1)")).toBeNull();
    expect(personalTitleFromText("Camarilla: Person gets +2 votes.", "Person (G1)")).toBeNull();
    expect(personalTitleFromText("Independent: Other has 2 votes (titled).", "Otherness (G1)")).toBeNull();
    expect(importCryptCard(200770).title).toBeNull(); // Kemintiri ADV: only merged
    expect(personalTitleFromText("Independent: Red List.\n[MERGED] 3 votes (titled): Ability.", "Example (G1)")).toBeNull();
    expect(personalTitleFromText("Independent: Danielle has 1 vote (titled).", "Danielle Diron (G3)")).toBe("personal1");
    expect(importCryptCard(200422).title).toBe("prince"); // existing named title
  });

  it("can vote in a real referendum; modifiers see a titled minion", () => {
    const state = game(200773); // Kephamos has 2 personal votes
    const actor = state.seats[0]!.minions[0]!;
    state.seats[0]!.hand.push({ id: "kr", name: "Kine Resources Contested" });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ["Alice", `play:Kine Resources Contested:basic:${actor.id}:kr`],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    for (let i = 0; i < 12; i++) {
      const frame = state.frames.find((f) => f.kind === "referendum");
      if (frame?.kind === "referendum" && frame.step === "polling") break;
      const dp = engine.decision()!;
      engine.choose(dp.options[0]!.id);
    }
    const rf = state.frames.find((f) => f.kind === "referendum");
    if (!rf || rf.kind !== "referendum") throw new Error("missing referendum");
    expect(vampireVotes(state, rf, actor).votes).toBe(2);
    rf.voteModifiers = [{ amount: -1, titledOnly: true, notSect: "anarch" }];
    expect(vampireVotes(state, rf, actor).votes).toBe(1);
    rf.voteModifiers = [];
    const dp = engine.decision()!;
    expect(dp.seat).toBe("Alice");
    const vote = dp.options.find((o) => o.id === `vote:${actor.id}:for`);
    expect(vote?.label).toContain("2 votes");
    engine.choose(vote!.id);
    expect(state.eventLog.some((e) => e.type === "VoteCast" && e.source === actor.id && e.count === 2)).toBe(true);
  });

  it("displays personal titles as votes rather than internal keys", () => {
    expect(titleLabel("personal1")).toBe("1 vote (titled)");
    expect(titleLabel("personal2")).toBe("2 votes (titled)");
    expect(titleLabel("personal3")).toBe("3 votes (titled)");
    expect(titleLabel("prince")).toBe("prince");
  });

  it("personal titles do not contest each other", () => {
    const state = game(200759);
    const other = buildGame({ decks: [deck("Bob", 200068), deck("Carol", 200132)], seed: 1, maxTurns: 40 }).seats[0]!.minions[0]!;
    state.seats[1]!.minions = [other];
    const engine = new VtesEngine(state, testRegistry);
    engine.decision();
    expect(state.seats[0]!.minions[0]!.title).toBe("personal1");
    expect(other.title).toBe("personal1");
    expect(state.eventLog.some((e) => e.type === "TitleContested")).toBe(false);
  });

  it("qualifies as titled but not as a prince, and its title is replaced, not added, on promotion", () => {
    const state = game(200759); // Kashan: one personal vote and Blood Cursed
    const actor = state.seats[0]!.minions[0]!;
    state.seats[0]!.hand.push({ id: "scourge", name: "Scourge" }, { id: "trad", name: "Second Tradition: Domain" });
    const engine = new VtesEngine(state, testRegistry);
    expect(testRegistry["Scourge"]!.modesPlayableBy!(actor)).toContain("basic");
    expect(testRegistry["Second Tradition: Domain"]!.modesPlayableBy!(actor)).toEqual([]);
    actor.sect = "anarch"; // personal title is not tied to a sect
    expect(actor.title).toBe("personal1");
    engine.emit({ type: "TitleGranted", minion: actor.id, title: "baron", city: "Boston" });
    expect(actor.title).toBe("baron");
    if (actor.title === null) throw new Error("title was not granted");
    expect(TITLE_VOTES[actor.title]).toBe(2); // not 2 + the former personal vote
    engine.emit({ type: "TitleLost", minion: actor.id });
    expect(actor.title).toBeNull(); // original personal title does not reappear
    expect(testRegistry["Scourge"]!.modesPlayableBy!(actor)).toEqual([]);
    expect(actor.bloodCursed).toBe(true);
  });

  it.each([200068, 200773])("%i retains its printed +1 bleed", (id) => {
    const state = game(id);
    expect(prospectiveBleed(state, state.seats[0]!.minions[0]!, "Bob")).toBe(2);
  });
});
