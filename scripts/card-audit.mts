/** Reproducible triage, NOT a proof that a card is correct.
 *
 * Scans every registry entry against the runtime handler and the raw spec.
 * Signals are deliberately conservative and may have false positives (e.g.
 * a bespoke overlay or conditional text). Every row remains UNREVIEWED unless
 * separately documented with a scenario and rule references.
 *
 * npm run cards:audit [-- <output directory>]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import registryData from "../src/cards/registry.json";
import { buildHandlerRegistry, cardSpecs, cryptSpecs } from "../src/cards/effects/cards.ts";
import type { CardRegistry } from "../src/cards/types.ts";

const registry = registryData as unknown as CardRegistry;
const handlers = buildHandlerRegistry();
const specs = new Map([...cardSpecs, ...cryptSpecs].map((spec) => [spec.krcgId, spec]));
const entries = Object.values(registry.entries).sort((a, b) => a.card.id - b.card.id);
type ManualStatus = "CONFIRMED_BUG" | "CODE_DISCREPANCY" | "UNRESOLVED" | "FIXED_TARGETED" | "PARTIAL_FIX" | "REVIEWED_NO_ISSUE_FOUND";
interface ManualFinding { id: number; name: string; status: ManualStatus; evidence: string }
const validStatuses: readonly ManualStatus[] = ["CONFIRMED_BUG", "CODE_DISCREPANCY", "UNRESOLVED", "FIXED_TARGETED", "PARTIAL_FIX", "REVIEWED_NO_ISSUE_FOUND"];
const findings = JSON.parse(readFileSync("docs/card-audit/manual-findings.json", "utf8")) as ManualFinding[];
const manual = new Map<number, ManualFinding>();
for (const finding of findings) {
  if (manual.has(finding.id) || registry.entries[finding.id]?.card.name !== finding.name || !validStatuses.includes(finding.status) || !finding.evidence) {
    throw new Error(`Invalid manual finding: ${finding.id} ${finding.name}`);
  }
  manual.set(finding.id, finding);
}
const signals = new Map<string, number>();
const quote = (s: unknown): string => `"${String(s).replaceAll('"', '""')}"`;
const rows = [["id", "name", "kind", "registry_supported", "manual_status", "triage_signals"].map(quote).join(",")];
for (const { card, supported } of entries) {
  const found: string[] = [];
  const h = handlers[card.name];
  const spec = specs.get(card.id);
  if (!h) found.push("no_runtime_handler");
  if (card.kind === "library" && h) {
    if ((h.costTypes?.(null, undefined) ?? []).length === 0) found.push("no_reported_library_type");
    if (card.poolCost !== null && card.poolCost !== (h.poolCost ?? 0)) found.push("pool_cost_mismatch_review");
    if (card.bloodCost !== null && card.bloodCost !== (h.bloodCost ?? 0)) found.push("blood_cost_mismatch_review");
    if (/^\s*(?:(?:master|equipment|ally|retainer|event)\s*[:.]\s*)?unique\b/i.test(card.cardText) && !h.isUnique) found.push("printed_unique_not_reported_review");
    if (spec?.cardType === "master" && !spec.permanent && spec.modes.length === 1 && spec.modes[0]?.effects.length === 1 && spec.modes[0].effects[0]?.kind === "gainPool" && !/\bgain\w*\s+(?:(?:\d+|x|\w+)\s+)?pool\b/i.test(card.cardText)) found.push("simple_gain_pool_text_mismatch_review");
  }
  if (card.kind === "crypt" && spec) {
    const perm = spec.permanent;
    const emptyPermanent = perm && Object.keys(perm.statics).length === 0 && (perm.tags?.length ?? 0) === 0 && Object.keys(perm).every((key) => ["where", "statics", "tags"].includes(key));
    const nontrivialText = /[:.]\s*\S/.test(card.cardText.trim());
    if (emptyPermanent && !spec.rush && spec.modes.length === 0 && nontrivialText) found.push("crypt_empty_spec_with_text_review");
  }
  for (const signal of found) signals.set(signal, (signals.get(signal) ?? 0) + 1);
  rows.push([card.id, card.name, card.kind, supported, manual.get(card.id)?.status ?? "UNREVIEWED", found.join("; ")].map(quote).join(","));
}
const output = process.argv[2] ?? "docs/card-audit";
mkdirSync(output, { recursive: true });
writeFileSync(join(output, "inventory.csv"), `${rows.join("\n")}\n`);
const library = entries.filter(({ card }) => card.kind === "library").length;
const crypt = entries.length - library;
const supported = entries.filter((entry) => entry.supported).length;
const report = `# Automatyczny przegląd kart — inwentarz\n\n` +
  `Zakres: aktualny src/cards/registry.json (${entries.length} kart: ${library} library i ${crypt} crypt; ${supported} oznaczonych jako supported). Każdy wpis jest w inventory.csv. Dane registry: fetchedAt ${registry.fetchedAt}.\n\n` +
  `To **triage, nie ręczny audyt ani potwierdzenie poprawności**. UNREVIEWED oznacza brak udokumentowanej w tym zestawieniu weryfikacji; brak sygnału niczego nie dowodzi. Sygnały są wskazówkami wymagającymi zbadania: overlay, wariant kosztu lub użycie słowa w innym znaczeniu mogą powodować fałszywe alarmy. Istnienie handlera i status supported też nie dowodzą poprawności.\n\n` +
  `| Sygnał | Kart |\n|---|---:|\n` + [...signals].sort(([a], [b]) => a.localeCompare(b)).map(([s, n]) => `| ${s} | ${n} |`).join("\n") +
  `\n\n## Udokumentowane ustalenia ręczne\n\n` +
  `To udokumentowane ustalenia, a nie pełne sprawdzenie wszystkich interakcji tych kart. CODE_DISCREPANCY to rozbieżność stwierdzona w kodzie bez nowego testu scenariuszowego; UNRESOLVED wymaga dalszej analizy. REVIEWED_NO_ISSUE_FOUND oznacza brak wykrytych problemów tylko w opisanym zakresie; PARTIAL_FIX oznacza, że znane błędy pozostają. Historyczne CONFIRMED_BUG nie gwarantuje odtworzenia testem — sprawdź dowód konkretnego wpisu. FIXED_TARGETED też nie oznacza pełnej poprawności. Źródło: manual-findings.json; podsumowania paczek: batches.md. Pozostałe ${entries.length - findings.length} kart mają status UNREVIEWED, czyli nie mają tu żadnego ręcznego ustalenia.\n\n` +
  `| ID | Karta | Status | Ustalenie |\n|---:|---|---|---|\n` + findings.map((f) => `| ${f.id} | ${f.name.replaceAll("|", "\\|")} | ${f.status} | ${f.evidence.replaceAll("|", "\\|")} |`).join("\n") +
  `\n\n## Znaczenie sygnałów\n\n` +
  `- no_runtime_handler: brak handlera o nazwie karty; dla niektórych wampirów bez zdolności może to być zamierzone.\n` +
  `- no_reported_library_type: handler nie zwraca typu library; może dotyczyć nieobsługiwanych typów.\n` +
  `- pool_cost_mismatch_review / blood_cost_mismatch_review: podstawowy koszt handlera różni się od wartości liczbowej w rejestrze; trzeba sprawdzić warianty i overlay.\n` +
  `- printed_unique_not_reported_review: tekst zaczyna się od Unique, ale handler nie raportuje unikalności; może chodzić o inną interpretację.\n` +
  `- simple_gain_pool_text_mismatch_review: master ma spec z jednym gainPool, ale prosty wzorzec nie znajduje gain pool w tekście; overlay może zmieniać efekt.\n` +
  `- crypt_empty_spec_with_text_review: spec krypty nie ma żadnego efektu ani statystyk, a tekst zawiera dalszy fragment po pierwszym dwukropku lub kropce; część fragmentów może być tylko opisem tytułu.\n\n` +
  `Uruchomienie: npm run cards:audit. Ograniczenia: nie sprawdza poprawności wszystkich klauzul, kolejności zdarzeń, zasad, UI ani botów; status każdej karty wymaga osobnego przeglądu i testów scenariuszowych.\n`;
writeFileSync(join(output, "README.md"), report.replaceAll("\u001e", "`"));
console.log(`${entries.length} cards; ${library} library, ${crypt} crypt; wrote ${output}`);
for (const [signal, n] of [...signals].sort(([a], [b]) => a.localeCompare(b))) console.log(`${signal}: ${n}`);
