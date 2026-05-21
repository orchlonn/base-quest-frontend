// Pure base-conversion helpers used by the games and live converter.
export type Base = 2 | 8 | 10 | 16;

export const BASE_LABELS: Record<Base, string> = {
  2: "binary",
  8: "octal",
  10: "decimal",
  16: "hexadecimal",
};

export function toBase(n: number, base: Base): string {
  return n.toString(base).toUpperCase();
}

function stripMatchingPrefix(value: string, base: Base): string {
  const cleaned = value.trim().toUpperCase();
  if (base === 2 && cleaned.startsWith("0B")) return cleaned.slice(2);
  if (base === 8 && cleaned.startsWith("0O")) return cleaned.slice(2);
  if (base === 16 && cleaned.startsWith("0X")) return cleaned.slice(2);
  return cleaned;
}

export function fromBase(s: string, base: Base): number | null {
  const cleaned = stripMatchingPrefix(s, base);
  if (!cleaned) return null;
  const ok =
    (base === 2 && /^[01]+$/.test(cleaned)) ||
    (base === 8 && /^[0-7]+$/.test(cleaned)) ||
    (base === 10 && /^\d+$/.test(cleaned)) ||
    (base === 16 && /^[0-9A-F]+$/.test(cleaned));
  if (!ok) return null;
  return parseInt(cleaned, base);
}

export function convertBase(value: string, from: Base, to: Base): string | null {
  const decimal = fromBase(value, from);
  if (decimal == null) return null;
  return toBase(decimal, to);
}

export type ConvType =
  | "DEC_TO_BIN"
  | "BIN_TO_DEC"
  | "DEC_TO_HEX"
  | "HEX_TO_DEC"
  | "DEC_TO_OCT"
  | "OCT_TO_DEC"
  | "HEX_TO_BIN"
  | "BIN_TO_HEX"
  | "OCT_TO_BIN"
  | "BIN_TO_OCT"
  | "OCT_TO_HEX"
  | "HEX_TO_OCT";

type ConversionSpec = {
  type: ConvType;
  from: Base;
  to: Base;
};

const CONVERSION_SPECS: ConversionSpec[] = [
  { type: "DEC_TO_BIN", from: 10, to: 2 },
  { type: "BIN_TO_DEC", from: 2, to: 10 },
  { type: "DEC_TO_HEX", from: 10, to: 16 },
  { type: "HEX_TO_DEC", from: 16, to: 10 },
  { type: "DEC_TO_OCT", from: 10, to: 8 },
  { type: "OCT_TO_DEC", from: 8, to: 10 },
  { type: "HEX_TO_BIN", from: 16, to: 2 },
  { type: "BIN_TO_HEX", from: 2, to: 16 },
  { type: "OCT_TO_BIN", from: 8, to: 2 },
  { type: "BIN_TO_OCT", from: 2, to: 8 },
  { type: "OCT_TO_HEX", from: 8, to: 16 },
  { type: "HEX_TO_OCT", from: 16, to: 8 },
];

function ruleFor(from: Base, to: Base): string {
  if (from === 10) {
    return `Repeatedly divide by ${to}, write each remainder, then read the remainders from bottom to top.`;
  }
  if (to === 10) {
    return `Multiply each digit by its ${from}-base place value, then add the results.`;
  }
  if (from === 2 && to === 16) {
    return "Group binary digits into sets of 4 from the right, then convert each group to one hex digit.";
  }
  if (from === 16 && to === 2) {
    return "Expand each hex digit into 4 binary bits, keeping leading zeros inside each group.";
  }
  if (from === 2 && to === 8) {
    return "Group binary digits into sets of 3 from the right, then convert each group to one octal digit.";
  }
  if (from === 8 && to === 2) {
    return "Expand each octal digit into 3 binary bits, keeping leading zeros inside each group.";
  }
  return "Convert the value to decimal first, then rewrite that decimal value in the target base.";
}

export function generateProblem(diff: "EASY" | "MEDIUM" | "HARD"): {
  type: ConvType;
  prompt: string;
  answer: string;
  display: string;
  sourceBase: Base;
  targetBase: Base;
  sourceLabel: string;
  targetLabel: string;
  rule: string;
} {
  const max = diff === "EASY" ? 15 : diff === "MEDIUM" ? 255 : 4095;
  const spec = CONVERSION_SPECS[Math.floor(Math.random() * CONVERSION_SPECS.length)];
  const n = Math.floor(Math.random() * max) + 1;
  const display = toBase(n, spec.from);
  const answer = toBase(n, spec.to);
  const sourceLabel = BASE_LABELS[spec.from];
  const targetLabel = BASE_LABELS[spec.to];

  return {
    type: spec.type,
    prompt: `Convert ${display} from ${sourceLabel} to ${targetLabel}.`,
    display,
    answer,
    sourceBase: spec.from,
    targetBase: spec.to,
    sourceLabel,
    targetLabel,
    rule: ruleFor(spec.from, spec.to),
  };
}
