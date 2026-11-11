import type { CardDef, RegistryEntry } from "../src/cards/types.ts";
import type { CardSpec } from "../src/cards/effects/spec.ts";

/** Selection order and exclusions must not depend on registry insertion order. */
export function selectBatch<T extends Pick<RegistryEntry, "card">>(entries: T[], after: number, count: number, excluded: ReadonlySet<number>): T[] {
  return entries.filter(({ card }) => card.id > after && !excluded.has(card.id))
    .sort((a, b) => a.card.id - b.card.id).slice(0, count);
}

/** These are review prompts, not correctness verdicts. In particular, specs
 * can be augmented or replaced by bespoke runtime handlers. */
export function batchFlags(card: CardDef, spec: CardSpec | undefined, handlerPresent: boolean): string[] {
  const flags: string[] = [];
  if (!handlerPresent) flags.push("no_runtime_handler");
  if (!spec) flags.push("no_raw_spec");
  if (!spec || card.kind !== "library") return flags;
  const modes = spec.modes;
  const effects = modes.flatMap((mode) => mode.effects);
  if (spec.cardType === "master" && !spec.permanent && effects.length === 1 && effects[0]?.kind === "gainPool" &&
    !/\bgain\w*\s+(?:(?:\d+|x|\w+)\s+)?pool\b/i.test(card.cardText)) flags.push("master_gain_pool_text_mismatch");
  if (spec.cardType === "action" && effects.length > 0 && effects.every((e) => e.kind === "actionStealth")) flags.push("action_only_stealth");
  if (spec.cardType === "combat" && effects.length > 0 && effects.every((e) => e.kind === "maneuver")) flags.push("combat_only_maneuver");
  if (/\[[A-Z]{3,}\]/.test(card.cardText) && modes.length > 0 && !modes.some((m) => m.level === "superior")) flags.push("uppercase_level_without_superior_mode");
  return flags;
}
