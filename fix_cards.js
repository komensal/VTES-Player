const fs = require("fs");
let content = fs.readFileSync("docs/card-audit/manual-findings.json", "utf-8");

// As the Crow [100102]
content = content.replace(
  "Modifier daje stealth zamiast unlock po udanej akcji i ograniczenia jednej kopii. Tekst: src/cards/registry.json, ID 100102; implementacja: src/cards/effects/cards.ts.",
  "Modifier daje stealth zamiast unlock po udanej akcji i ograniczenia jednej kopii. Wymaga nowych typów efektów (unlockSelf, limitOneCopy). Tekst: src/cards/registry.json, ID 100102; implementacja: src/cards/effects/cards.ts."
);

// Ashes to Ashes [100105]
content = content.replace(
  "Spec opisuje wyłącznie maneuver zamiast requirements other vampire and target. Spec nie wymaga other vampire. Tekst: src/cards/registry.json, ID 100105; implementacja: src/cards/effects/cards.ts.",
  "Spec opisuje wyłącznie maneuver zamiast requirements other vampire and target. Spec nie wymaga other vampire. Wymaga nowych typów efektów (requireOtherVampire, putInPlayOnTarget). Tekst: src/cards/registry.json, ID 100105; implementacja: src/cards/effects/cards.ts."
);

// Aura Absorption [100111]
content = content.replace(
  "Spec opisuje wyłącznie maneuver zamiast requirements other vampire and target. Spec nie wymaga other vampire. Tekst: src/cards/registry.json, ID 100111; implementacja: src/cards/effects/cards.ts.",
  "Spec opisuje wyłącznie maneuver zamiast requirements other vampire and target. Spec nie wymaga other vampire. Wymaga nowych typów efektów (requireOtherVampire, putInPlayOnTarget). Tekst: src/cards/registry.json, ID 100111; implementacja: src/cards/effects/cards.ts."
);

// Aura Reading [100113]
content = content.replace(
  "Spec opisuje wyłącznie maneuver zamiast requirements other vampire and target. Spec nie wymaga other vampire. Tekst: src/cards/registry.json, ID 100113; implementacja: src/cards/effects/cards.ts.",
  "Spec opisuje wyłącznie maneuver zamiast requirements other vampire and target. Spec nie wymaga other vampire. Wymaga nowych typów efektów (requireOtherVampire, putInPlayOnTarget). Tekst: src/cards/registry.json, ID 100113; implementacja: src/cards/effects/cards.ts."
);

// Auto-da-fé [100116]
content = content.replace(
  "Spec opisuje wyłącznie maneuver zamiast requirements other vampire and target. Spec nie wymaga other vampire. Tekst: src/cards/registry.json, ID 100116; implementacja: src/cards/effects/cards.ts.",
  "Spec opisuje wyłącznie maneuver zamiast requirements other vampire and target. Spec nie wymaga other vampire. Wymaga nowych typów efektów (requireOtherVampire, putInPlayOnTarget). Tekst: src/cards/registry.json, ID 100116; implementacja: src/cards/effects/cards.ts."
);

fs.writeFileSync("docs/card-audit/manual-findings.json", content);
console.log("Zmieniono 5 kart: As the Crow, Ashes to Ashes, Aura Absorption, Aura Reading, Auto-da-fé");
