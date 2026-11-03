import { describe, it, expect } from "vitest";
import { cardSpecs } from "../../src/cards/effects/cards.ts";

describe("Elemental Stoicism", () => {
  it("ma 3 tryby: [for] prevent non-agg, [for][obf] treatAgg combat, [FOR][obf] action attach", () => {
    const spec = (cardSpecs as any[]).find((c: any) => c.name === "Elemental Stoicism");
    expect(spec).toBeDefined();
    expect(spec.cardType).toBe("actionOrCombat");
    expect(spec.modes.length).toBe(3);
    const prevent = spec.modes.find((m: any) => m.discipline === "for");
    expect(prevent.effects[0].kind).toBe("prevent");
    expect(prevent.effects[0].nonAggravated).toBe(true);
    const treat = spec.modes.find((m: any) => m.discipline?.all?.includes("for") && m.level === "basic");
    expect(treat.effects[0].kind).toBe("treatAggravatedAsNormal");
    expect(treat.effects[0].scope).toBe("combat");
    const attach = spec.modes.find((m: any) => m.level === "superior");
    expect(attach.effects.some((e: any) => e.kind === "actionStealth")).toBe(true);
    expect(attach.effects.some((e: any) => e.kind === "attachSelf" && e.statics.treatsAggravatedAsNormalInCombat)).toBe(true);
    expect(attach.effects.find((e: any) => e.kind === "attachSelf").burnWhenBearerLeavesReady).toBe(true);
  });
});
