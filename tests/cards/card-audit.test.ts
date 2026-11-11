import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import registry from "../../src/cards/registry.json";

describe("the card audit inventory", () => {
  it("scans every registry card and distinguishes evidence from triage", () => {
    const dir = mkdtempSync(join(tmpdir(), "vtes-card-audit-"));
    try {
      execFileSync(process.execPath, ["--import", "tsx", "scripts/card-audit.mts", dir], { cwd: process.cwd() });
      const csv = readFileSync(join(dir, "inventory.csv"), "utf8");
      const rows = csv.trimEnd().split("\n");
      expect(rows).toHaveLength(Object.keys(registry.entries).length + 1);
      expect(csv).toContain('"100207","Blood Puppy","library","true","FIXED_TARGETED"');
      expect(csv).toContain('"100216","Blood Turnip","library","true","CONFIRMED_BUG"');
      expect(csv).toContain('"200232","Cailean (G2)","crypt","true","CONFIRMED_BUG","crypt_empty_spec_with_text_review"');
      expect(csv).toContain('"UNREVIEWED"');
      const report = readFileSync(join(dir, "README.md"), "utf8");
      expect(report).toContain("triage, nie ręczny audyt ani potwierdzenie poprawności");
      expect(report).toContain("fałszywe alarmy");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
