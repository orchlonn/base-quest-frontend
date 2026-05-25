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

// Conversion type subsets per progressive difficulty tier
const BEGINNER_SPECS = CONVERSION_SPECS.filter((s) =>
  (["DEC_TO_BIN", "BIN_TO_DEC"] as ConvType[]).includes(s.type)
);
const INTERMEDIATE_SPECS = CONVERSION_SPECS.filter((s) =>
  (["DEC_TO_BIN", "BIN_TO_DEC", "DEC_TO_HEX", "HEX_TO_DEC", "BIN_TO_HEX", "HEX_TO_BIN"] as ConvType[]).includes(s.type)
);

export type GameDifficulty =
  | "EASY"
  | "MEDIUM"
  | "HARD"
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED";

const DIFF_PARAMS: Record<GameDifficulty, { max: number; specs: ConversionSpec[] }> = {
  EASY:         { max: 15,   specs: CONVERSION_SPECS },
  MEDIUM:       { max: 255,  specs: CONVERSION_SPECS },
  HARD:         { max: 4095, specs: CONVERSION_SPECS },
  BEGINNER:     { max: 15,   specs: BEGINNER_SPECS },
  INTERMEDIATE: { max: 255,  specs: INTERMEDIATE_SPECS },
  ADVANCED:     { max: 4095, specs: CONVERSION_SPECS },
};

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

export function generateProblem(diff: GameDifficulty = "EASY"): {
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
  const { max, specs } = DIFF_PARAMS[diff];
  const spec = specs[Math.floor(Math.random() * specs.length)];
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

// ─── Hint system ──────────────────────────────────────────────────────────────

export function hintForType(type: ConvType): string[] {
  const h: Record<ConvType, string[]> = {
    DEC_TO_BIN: [
      "Divide the decimal number by 2.",
      "Write the remainder (0 or 1) — this becomes the rightmost bit.",
      "Divide the quotient by 2 again and record the new remainder.",
      "Repeat until the quotient reaches 0.",
      "Read all the remainders from bottom to top to get your binary answer.",
    ],
    BIN_TO_DEC: [
      "Write the place value under each bit, starting from the right: 1, 2, 4, 8, 16, 32, …",
      "For every bit that is 1, include that place value in your sum.",
      "Add all the included place values together — that is the decimal answer.",
    ],
    DEC_TO_HEX: [
      "Divide the decimal number by 16.",
      "Write the remainder. If it is 10 write A, 11 = B, 12 = C, 13 = D, 14 = E, 15 = F.",
      "Divide the quotient by 16 again and record the new remainder.",
      "Repeat until the quotient is 0, then read remainders from bottom to top.",
    ],
    HEX_TO_DEC: [
      "A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.",
      "The rightmost hex digit is worth its face value × 16⁰ = 1.",
      "The next digit to the left is worth its face value × 16¹ = 16.",
      "Multiply each digit by its place value (power of 16) and add all results.",
    ],
    HEX_TO_BIN: [
      "Each hex digit expands to exactly 4 binary bits — no division needed.",
      "0=0000  1=0001  2=0010  3=0011  4=0100  5=0101  6=0110  7=0111",
      "8=1000  9=1001  A=1010  B=1011  C=1100  D=1101  E=1110  F=1111",
      "Replace every hex digit with its 4-bit group and write them side by side.",
    ],
    BIN_TO_HEX: [
      "Group the binary digits into sets of 4, starting from the right.",
      "If the leftmost group has fewer than 4 digits, pad it with leading zeros.",
      "Convert each 4-bit group to a single hex digit (e.g. 1101 = D, 0110 = 6).",
    ],
    BIN_TO_OCT: [
      "Group the binary digits into sets of 3, starting from the right.",
      "If the leftmost group has fewer than 3 digits, pad it with leading zeros.",
      "Convert each 3-bit group to one octal digit (e.g. 101 = 5, 010 = 2).",
    ],
    OCT_TO_BIN: [
      "Each octal digit expands to exactly 3 binary bits — no division needed.",
      "0=000  1=001  2=010  3=011  4=100  5=101  6=110  7=111",
      "Replace every octal digit with its 3-bit group and write them side by side.",
    ],
    DEC_TO_OCT: [
      "Divide the decimal number by 8.",
      "Write the remainder (always 0 through 7).",
      "Divide the quotient by 8 again and record the new remainder.",
      "Repeat until the quotient is 0, then read remainders from bottom to top.",
    ],
    OCT_TO_DEC: [
      "Octal place values are powers of 8: …512, 64, 8, 1.",
      "The rightmost digit is worth its value × 1.",
      "The next digit to the left is worth its value × 8.",
      "Multiply each digit by its place value and add all results.",
    ],
    OCT_TO_HEX: [
      "There is no direct shortcut — use decimal as a bridge.",
      "Step 1: Multiply each octal digit by its power of 8 and add (gives decimal).",
      "Step 2: Divide that decimal by 16 repeatedly, reading remainders bottom to top.",
    ],
    HEX_TO_OCT: [
      "There is no direct shortcut — use decimal as a bridge.",
      "Step 1: Multiply each hex digit by its power of 16 and add (gives decimal).",
      "Step 2: Divide that decimal by 8 repeatedly, reading remainders bottom to top.",
    ],
  };
  return h[type];
}

// ─── Step-by-step explanation engine ─────────────────────────────────────────

export type ExplainLine = {
  text: string;
  code?: boolean;      // render in monospace
  highlight?: boolean; // bold accent — used for the final answer
  label?: boolean;     // section heading style
};

function hexCharVal(c: string): number {
  const code = c.toUpperCase().charCodeAt(0);
  return code >= 65 ? code - 55 : code - 48;
}

function valToHexChar(n: number): string {
  return n >= 10 ? String.fromCharCode(n + 55) : String(n);
}

function makeDivisionLadder(n: number, base: number): ExplainLine[] {
  const steps: { dividend: number; quotient: number; rem: number }[] = [];
  let current = n;
  while (current > 0) {
    steps.push({ dividend: current, quotient: Math.floor(current / base), rem: current % base });
    current = Math.floor(current / base);
  }

  const lines: ExplainLine[] = [];
  // Show at most 8 steps; truncate with ellipsis for large numbers
  const MAX = 8;
  const visible = steps.length > MAX ? [...steps.slice(0, 4), ...steps.slice(-2)] : steps;
  const hasGap = steps.length > MAX;

  visible.forEach((s, i) => {
    if (hasGap && i === 4) {
      lines.push({ text: "  … (intermediate steps) …", code: true });
    }
    const remStr =
      base === 16 && s.rem >= 10
        ? `${s.rem}  (${valToHexChar(s.rem)})`
        : String(s.rem);
    lines.push({ text: `${s.dividend} ÷ ${base} = ${s.quotient}   remainder ${remStr}`, code: true });
  });

  const result = steps
    .map((s) => valToHexChar(s.rem))
    .reverse()
    .join("");
  lines.push({ text: `Read remainders bottom to top → ${result}`, code: true, highlight: true });
  return lines;
}

function makePlaceValues(s: string, base: number): ExplainLine[] {
  const chars = s.toUpperCase().split("").reverse();
  const lines: ExplainLine[] = [];
  let total = 0;
  const nonZeroTerms: string[] = [];

  chars.forEach((c, i) => {
    const digitVal = parseInt(c, base);
    const placeVal = Math.pow(base, i);
    const product = digitVal * placeVal;
    total += product;
    const cDisplay = base === 16 && digitVal >= 10 ? `${c}(=${digitVal})` : c;
    lines.push({ text: `${cDisplay} × ${base}^${i} = ${cDisplay} × ${placeVal} = ${product}`, code: true });
    if (product !== 0) nonZeroTerms.push(String(product));
  });

  const sumStr = nonZeroTerms.length > 0 ? nonZeroTerms.join(" + ") : "0";
  lines.push({ text: `Sum: ${sumStr} = ${total}`, code: true, highlight: true });
  return lines;
}

function makeBitGrouping(
  s: string,
  groupSize: 3 | 4,
  binaryIsSource: boolean
): ExplainLine[] {
  const upper = s.toUpperCase();
  const lines: ExplainLine[] = [];
  const targetBase = groupSize === 4 ? 16 : 8;

  if (binaryIsSource) {
    const padSize = Math.ceil(upper.length / groupSize) * groupSize;
    const padded = upper.padStart(padSize, "0");
    if (padded !== upper) {
      lines.push({ text: `Pad to ${padSize} digits: ${padded}`, code: true });
    }
    const groups: string[] = [];
    for (let i = 0; i < padded.length; i += groupSize) {
      groups.push(padded.slice(i, i + groupSize));
    }
    lines.push({ text: `Groups: ${groups.join(" | ")}`, code: true });
    groups.forEach((g) => {
      const val = parseInt(g, 2);
      const rep = valToHexChar(val);
      const suffix = targetBase === 16 && val >= 10 ? `  (= ${rep})` : "";
      lines.push({ text: `${g} = ${val}${suffix}`, code: true });
    });
    const result = groups.map((g) => valToHexChar(parseInt(g, 2))).join("");
    lines.push({ text: `Answer: ${result}`, code: true, highlight: true });
  } else {
    const sourceBase = groupSize === 4 ? 16 : 8;
    const chars = upper.split("");
    chars.forEach((c) => {
      const val = parseInt(c, sourceBase);
      const bits = val.toString(2).padStart(groupSize, "0");
      lines.push({ text: `${c} → ${bits}`, code: true });
    });
    const result = chars
      .map((c) => parseInt(c, sourceBase).toString(2).padStart(groupSize, "0"))
      .join("");
    lines.push({ text: `Answer: ${result}`, code: true, highlight: true });
  }

  return lines;
}

export function explainConversion(
  type: ConvType,
  displayValue: string,
  _answer: string
): ExplainLine[] {
  const v = displayValue.toUpperCase();

  const sourceBaseMap: Record<ConvType, number> = {
    DEC_TO_BIN: 10, BIN_TO_DEC: 2,  DEC_TO_HEX: 10, HEX_TO_DEC: 16,
    DEC_TO_OCT: 10, OCT_TO_DEC: 8,  HEX_TO_BIN: 16, BIN_TO_HEX: 2,
    OCT_TO_BIN: 8,  BIN_TO_OCT: 2,  OCT_TO_HEX: 8,  HEX_TO_OCT: 16,
  };

  const n = parseInt(v, sourceBaseMap[type]);

  switch (type) {
    case "DEC_TO_BIN": return makeDivisionLadder(n, 2);
    case "BIN_TO_DEC": return makePlaceValues(v, 2);
    case "DEC_TO_HEX": return makeDivisionLadder(n, 16);
    case "HEX_TO_DEC": return makePlaceValues(v, 16);
    case "DEC_TO_OCT": return makeDivisionLadder(n, 8);
    case "OCT_TO_DEC": return makePlaceValues(v, 8);
    case "HEX_TO_BIN": return makeBitGrouping(v, 4, false);
    case "BIN_TO_HEX": return makeBitGrouping(v, 4, true);
    case "OCT_TO_BIN": return makeBitGrouping(v, 3, false);
    case "BIN_TO_OCT": return makeBitGrouping(v, 3, true);
    case "OCT_TO_HEX": return [
      { text: "Step 1 — Octal → Decimal (place values):", label: true },
      ...makePlaceValues(v, 8),
      { text: "Step 2 — Decimal → Hex (repeated division):", label: true },
      ...makeDivisionLadder(n, 16),
    ];
    case "HEX_TO_OCT": return [
      { text: "Step 1 — Hex → Decimal (place values):", label: true },
      ...makePlaceValues(v, 16),
      { text: "Step 2 — Decimal → Octal (repeated division):", label: true },
      ...makeDivisionLadder(n, 8),
    ];
    default: return [{ text: `Answer: ${_answer}`, code: true, highlight: true }];
  }
}
