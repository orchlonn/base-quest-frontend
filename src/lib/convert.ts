// Pure base-conversion helpers used by the games.
export function toBase(n: number, base: 2 | 8 | 10 | 16): string {
  return n.toString(base).toUpperCase();
}

export function fromBase(s: string, base: 2 | 8 | 10 | 16): number | null {
  const cleaned = s.trim().toUpperCase();
  if (!cleaned) return null;
  const ok =
    (base === 2 && /^[01]+$/.test(cleaned)) ||
    (base === 8 && /^[0-7]+$/.test(cleaned)) ||
    (base === 10 && /^\d+$/.test(cleaned)) ||
    (base === 16 && /^[0-9A-F]+$/.test(cleaned));
  if (!ok) return null;
  return parseInt(cleaned, base);
}

export type ConvType = "DEC_TO_BIN" | "BIN_TO_DEC" | "DEC_TO_HEX" | "HEX_TO_BIN";

export function generateProblem(diff: "EASY" | "MEDIUM" | "HARD"): {
  type: ConvType;
  prompt: string;
  answer: string;
  display: string;
} {
  const max = diff === "EASY" ? 15 : diff === "MEDIUM" ? 255 : 4095;
  const types: ConvType[] = ["DEC_TO_BIN", "BIN_TO_DEC", "DEC_TO_HEX", "HEX_TO_BIN"];
  const type = types[Math.floor(Math.random() * types.length)];
  const n = Math.floor(Math.random() * max) + 1;

  switch (type) {
    case "DEC_TO_BIN":
      return { type, prompt: `${n} (decimal) → binary`, display: `${n}`, answer: toBase(n, 2) };
    case "BIN_TO_DEC":
      return { type, prompt: `${toBase(n, 2)} (binary) → decimal`, display: toBase(n, 2), answer: `${n}` };
    case "DEC_TO_HEX":
      return { type, prompt: `${n} (decimal) → hex`, display: `${n}`, answer: toBase(n, 16) };
    case "HEX_TO_BIN":
      return { type, prompt: `${toBase(n, 16)} (hex) → binary`, display: toBase(n, 16), answer: toBase(n, 2) };
  }
}
