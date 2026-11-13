import type { GameState, PermanentInPlay, SeatId } from "./state.ts";
import type { HandlerRegistry } from "./handlers.ts";

/** Stores which can replace this seat's library draw at the current instant.
 * This must agree for option enumeration and actual draw resolution. */
export function drawRedirectSources(
  state: GameState,
  seat: SeatId,
  registry: HandlerRegistry,
): PermanentInPlay[] {
  const out: PermanentInPlay[] = [];
  for (const s of state.seats) {
    const candidates = [
      ...s.permanents.map((entry) => ({ entry, minion: null })),
      ...s.minions.flatMap((m) => m.attached.map((entry) => ({ entry, minion: m.id }))),
    ];
    for (const { entry, minion } of candidates) {
      const controller = entry.controller ?? s.id;
      if (controller !== seat || !entry.stored?.length) continue;
      if (registry[entry.card.name]?.canRedirectDraw?.(entry, { seat: controller, minion }, state) !== true) continue;
      out.push(entry);
    }
  }
  return out;
}
