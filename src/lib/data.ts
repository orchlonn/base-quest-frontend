import lessonsJson from "@/data/lessons.json";
import preTestJson from "@/data/pre-test.json";
import postTestJson from "@/data/post-test.json";
import achievementsJson from "@/data/achievements.json";
import badgesJson from "@/data/badges.json";

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  topic: string;
  order: number;
  description: string;
  content: string;
};

export type Question = {
  id: string;
  prompt: string;
  type: "MULTIPLE_CHOICE" | "INPUT";
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  choices?: string[];
  answer: string;
  explanation?: string;
};

export type Achievement = {
  code: string;
  title: string;
  description: string;
  iconKey: string;
  xpReward: number;
};

export type Badge = {
  code: string;
  title: string;
  description: string;
  rankCode: string;
  minXp: number;
  iconKey: string;
};

export const LESSONS: Lesson[] = (lessonsJson as Lesson[]).slice().sort(
  (a, b) => a.order - b.order
);

export const PRE_TEST: Question[] = preTestJson as Question[];
export const POST_TEST: Question[] = postTestJson as Question[];
export const ACHIEVEMENTS: Achievement[] = achievementsJson as Achievement[];
export const BADGES: Badge[] = badgesJson as Badge[];

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Public-facing question (no answer leaked to the client logic that renders).
export type PublicQuestion = Omit<Question, "answer" | "explanation">;

function strip(q: Question): PublicQuestion {
  const { answer: _a, explanation: _e, ...rest } = q;
  return rest;
}

export function pickPreTest(count = 10): PublicQuestion[] {
  return shuffle(PRE_TEST).slice(0, count).map(strip);
}

export function pickPostTest(count = 10): PublicQuestion[] {
  return shuffle(POST_TEST).slice(0, count).map(strip);
}

export function findQuestion(id: string): Question | undefined {
  return PRE_TEST.find((q) => q.id === id) ?? POST_TEST.find((q) => q.id === id);
}
