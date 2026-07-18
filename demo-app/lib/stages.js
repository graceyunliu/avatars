// The 8 mission stages + a lightweight detector that infers progress from
// Matteo's German lines. Heuristic by design — the real orchestrator module
// replaces this post-demo. Detection is monotonic (never goes backward).
export const STAGES = [
  "Greeting",
  "Name",
  "Address",
  "Arrival",
  "Family",
  "Documents",
  "Fee + next steps",
  "Goodbye",
];

const SIGNATURES = [
  { stage: 1, words: ["termin"] },
  { stage: 2, words: ["wie heissen sie", "ihr name", "wie ist ihr name", "buchstabieren"] },
  { stage: 3, words: ["adresse", "wohnen sie", "strasse"] },
  { stage: 4, words: ["angekommen", "warum sind sie", "wegen arbeit"] },
  { stage: 5, words: ["ledig", "verheiratet", "kinder"] },
  { stage: 6, words: ["dokumente", "mietvertrag", "krankenversicherung", "krankenkasse", "passfoto", "arbeitsvertrag"] },
  { stage: 7, words: ["franken", "kostet", "migrationsamt", "fingerabdr"] },
  { stage: 8, words: ["wiedersehen", "willkommen in z"] },
];

// Returns the highest stage whose signature appears in this Matteo line
export function detectStage(germanText) {
  const t = (germanText || "").toLowerCase();
  let found = 0;
  for (const sig of SIGNATURES) {
    if (sig.words.some((w) => t.includes(w))) found = Math.max(found, sig.stage);
  }
  return found;
}
