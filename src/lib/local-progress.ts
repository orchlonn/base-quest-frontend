"use client";
import { ACHIEVEMENTS, findQuestion, LESSONS, type Question } from "@/lib/data";
import { levelForXp, rankForXp } from "@/lib/xp";

const STORAGE_KEY = "bq_progress_v1";

export type GameMode =
  | "CONVERSION_CHALLENGE"
  | "TOWER_DEFENSE"
  | "MEMORY_MATCH"
  | "SPEED_QUIZ";

export type LessonProgressEntry = {
  lessonId: string;
  slug: string;
  completed: boolean;
  percent: number;
  updatedAt: string;
};

export type QuizAttempt = {
  id: string;
  kind: "PRE_TEST" | "POST_TEST";
  score: number;
  totalItems: number;
  correctCount: number;
  topicBreakdown: Record<string, number>;
  takenAt: string;
};

export type GameScoreEntry = {
  id: string;
  mode: GameMode;
  score: number;
  xpEarned: number;
  streakMax: number;
  meta?: Record<string, any> | null;
  playedAt: string;
};

export type UnlockedAchievement = {
  code: string;
  unlockedAt: string;
};

export type ProgressState = {
  username: string;
  xp: number;
  streakDays: number;
  lastActiveAt: string;
  lessonProgress: LessonProgressEntry[];
  quizAttempts: QuizAttempt[];
  gameScores: GameScoreEntry[];
  achievements: UnlockedAchievement[];
};

function defaultState(): ProgressState {
  return {
    username: "player",
    xp: 0,
    streakDays: 1,
    lastActiveAt: new Date().toISOString(),
    lessonProgress: [],
    quizAttempts: [],
    gameScores: [],
    achievements: [],
  };
}

const isBrowser = () => typeof window !== "undefined";
const listeners = new Set<() => void>();

function read(): ProgressState {
  if (!isBrowser()) return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function write(next: ProgressState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((fn) => fn());
}

export function getProgress(): ProgressState {
  return read();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setUsername(username: string) {
  const cleaned = username.trim().slice(0, 20) || "player";
  const s = read();
  write({ ...s, username: cleaned });
}

export function resetProgress() {
  write(defaultState());
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function touchStreak(s: ProgressState): ProgressState {
  // Simple streak: if last active was a different calendar day, +1; if >1 day, reset to 1.
  const last = new Date(s.lastActiveAt);
  const now = new Date();
  const sameDay =
    last.getFullYear() === now.getFullYear() &&
    last.getMonth() === now.getMonth() &&
    last.getDate() === now.getDate();
  if (sameDay) return { ...s, lastActiveAt: now.toISOString() };

  const diffDays = Math.floor(
    (now.getTime() - new Date(last.toDateString()).getTime()) / 86_400_000
  );
  const streakDays = diffDays === 1 ? s.streakDays + 1 : 1;
  return { ...s, streakDays, lastActiveAt: now.toISOString() };
}

export function markLessonComplete(lesson: { id: string; slug: string }) {
  const s = read();
  const existing = s.lessonProgress.find((p) => p.lessonId === lesson.id);
  const updated: LessonProgressEntry = {
    lessonId: lesson.id,
    slug: lesson.slug,
    completed: true,
    percent: 100,
    updatedAt: new Date().toISOString(),
  };
  const lessonProgress = existing
    ? s.lessonProgress.map((p) => (p.lessonId === lesson.id ? updated : p))
    : [...s.lessonProgress, updated];
  write(touchStreak({ ...s, lessonProgress }));
}

export type GradeResult = {
  attempt: QuizAttempt;
  topicBreakdown: Record<string, number>;
  recommendedLessons: { id: string; slug: string; title: string; topic: string }[];
};

function gradeAnswers(
  kind: "PRE_TEST" | "POST_TEST",
  answers: { questionId: string; value: string }[]
): GradeResult {
  const topicTotals: Record<string, { correct: number; total: number }> = {};
  let correctCount = 0;

  for (const a of answers) {
    const q = findQuestion(a.questionId);
    if (!q) continue;
    const bucket = (topicTotals[q.topic] ||= { correct: 0, total: 0 });
    bucket.total++;
    const ok =
      a.value.trim().toLowerCase() === q.answer.trim().toLowerCase();
    if (ok) {
      correctCount++;
      bucket.correct++;
    }
  }

  const totalItems = answers.length;
  const score = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
  const topicBreakdown = Object.fromEntries(
    Object.entries(topicTotals).map(([k, v]) => [k, v.total ? v.correct / v.total : 0])
  );

  const attempt: QuizAttempt = {
    id: uid("attempt"),
    kind,
    score,
    totalItems,
    correctCount,
    topicBreakdown,
    takenAt: new Date().toISOString(),
  };

  const weakest = Object.entries(topicBreakdown)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([t]) => t);

  const recommendedLessons = LESSONS.filter((l) => weakest.includes(l.topic)).map(
    (l) => ({ id: l.id, slug: l.slug, title: l.title, topic: l.topic })
  );

  return { attempt, topicBreakdown, recommendedLessons };
}

export function gradePreTest(
  answers: { questionId: string; value: string }[]
): GradeResult {
  const result = gradeAnswers("PRE_TEST", answers);
  const s = read();
  write(touchStreak({ ...s, quizAttempts: [result.attempt, ...s.quizAttempts] }));
  return result;
}

export type PostTestResult = GradeResult & {
  preTestScore: number | null;
  postTestScore: number;
  improvementPct: number | null;
  strongestTopic: string | null;
  weakestTopic: string | null;
  feedback: string;
};

function buildFeedback(
  score: number,
  strongest: string | null,
  weakest: string | null,
  improvement: number | null
): string {
  const parts: string[] = [];
  if (score >= 90) parts.push("Outstanding work — you've mastered base conversions!");
  else if (score >= 70)
    parts.push("Great job! You're well on your way to becoming a Conversion Wizard.");
  else if (score >= 50)
    parts.push("Solid effort. A bit more practice and you'll level up fast.");
  else
    parts.push("Keep going — revisit the lessons and try the games to reinforce concepts.");

  if (strongest) parts.push(`Strongest area: ${strongest.toLowerCase()}.`);
  if (weakest && weakest !== strongest) parts.push(`Focus next on: ${weakest.toLowerCase()}.`);
  if (improvement != null) {
    if (improvement > 0) parts.push(`You improved by ${improvement}% from your pre-test.`);
    else if (improvement === 0) parts.push("You matched your pre-test score — try again to beat it!");
    else parts.push("Don't worry — try the lessons again and retake the quiz.");
  }
  return parts.join(" ");
}

export function gradePostTest(
  answers: { questionId: string; value: string }[]
): PostTestResult {
  const base = gradeAnswers("POST_TEST", answers);
  const xpGain = base.attempt.correctCount * 15;

  const s = read();
  const previousPre = s.quizAttempts.find((a) => a.kind === "PRE_TEST");
  const next: ProgressState = {
    ...s,
    xp: s.xp + xpGain,
    quizAttempts: [base.attempt, ...s.quizAttempts],
  };
  write(touchStreak(next));

  const sorted = Object.entries(base.topicBreakdown).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0]?.[0] ?? null;
  const weakest = sorted[sorted.length - 1]?.[0] ?? null;
  const improvementPct = previousPre
    ? Math.round(
        ((base.attempt.score - previousPre.score) / Math.max(previousPre.score, 1)) * 100
      )
    : null;

  return {
    ...base,
    preTestScore: previousPre?.score ?? null,
    postTestScore: base.attempt.score,
    improvementPct,
    strongestTopic: strongest,
    weakestTopic: weakest,
    feedback: buildFeedback(base.attempt.score, strongest, weakest, improvementPct),
  };
}

export type RecordedGameResult = {
  entry: GameScoreEntry;
  xpEarned: number;
  newAchievements: { code: string; title: string; description: string }[];
};

export function recordGameScore(args: {
  mode: GameMode;
  score: number;
  streakMax?: number;
  meta?: Record<string, any> | null;
}): RecordedGameResult {
  const { mode, score, streakMax = 0, meta = null } = args;
  const xpEarned = Math.min(score, 500);

  const s = read();
  const entry: GameScoreEntry = {
    id: uid("score"),
    mode,
    score,
    xpEarned,
    streakMax,
    meta,
    playedAt: new Date().toISOString(),
  };

  // Award achievements
  const have = new Set(s.achievements.map((a) => a.code));
  const newlyUnlocked: UnlockedAchievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (have.has(a.code)) continue;
    const earned =
      a.code === "FIRST_GAME" ||
      (a.code === "STREAK_5" && streakMax >= 5) ||
      (a.code === "STREAK_10" && streakMax >= 10) ||
      (a.code === "SCORE_500" && score >= 500);
    if (earned) newlyUnlocked.push({ code: a.code, unlockedAt: new Date().toISOString() });
  }

  const next: ProgressState = {
    ...s,
    xp: s.xp + xpEarned,
    gameScores: [entry, ...s.gameScores].slice(0, 100),
    achievements: [...s.achievements, ...newlyUnlocked],
  };
  write(touchStreak(next));

  const newAchievements = newlyUnlocked.map((u) => {
    const a = ACHIEVEMENTS.find((x) => x.code === u.code)!;
    return { code: a.code, title: a.title, description: a.description };
  });
  return { entry, xpEarned, newAchievements };
}

export function deriveProfile(s: ProgressState) {
  const level = levelForXp(s.xp);
  const rankCode = rankForXp(s.xp);
  const xpRange = (() => {
    const current = 100 * (level - 1) * (level - 1);
    const next = 100 * level * level;
    return { current, next, level };
  })();
  return {
    username: s.username,
    xp: s.xp,
    level,
    rankCode,
    streakDays: s.streakDays,
    xpRange,
    achievements: s.achievements
      .map((u) => {
        const a = ACHIEVEMENTS.find((x) => x.code === u.code);
        return a
          ? {
              code: a.code,
              title: a.title,
              description: a.description,
              iconKey: a.iconKey,
              unlockedAt: u.unlockedAt,
            }
          : null;
      })
      .filter(Boolean) as {
      code: string;
      title: string;
      description: string;
      iconKey: string;
      unlockedAt: string;
    }[],
  };
}

export function hasTakenPreTest(s: ProgressState = read()): boolean {
  return s.quizAttempts.some((a) => a.kind === "PRE_TEST");
}
