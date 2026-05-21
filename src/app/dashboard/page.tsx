"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProfile, useProgress } from "@/store/profile";
import { hasTakenPreTest, type QuizAttempt } from "@/lib/local-progress";
import { LESSONS } from "@/lib/data";
import { XPBar } from "@/components/XPBar";

type Tile = {
  href: string;
  title: string;
  body: string;
  cta: string;
  icon: string;
  accent: "mint" | "coral" | "gold" | "sky" | "lilac";
};

const ACCENT_BAR: Record<Tile["accent"], string> = {
  mint: "bg-[var(--mint)]",
  coral: "bg-[var(--coral)]",
  gold: "bg-[var(--gold)]",
  sky: "bg-[var(--sky)]",
  lilac: "bg-[var(--lilac)]",
};

const ACCENT_CTA: Record<Tile["accent"], string> = {
  mint: "text-[var(--mint-dark)]",
  coral: "text-[var(--coral-dark)]",
  gold: "text-[var(--gold-dark)]",
  sky: "text-[var(--sky-dark)]",
  lilac: "text-[var(--lilac-dark)]",
};

export default function DashboardPage() {
  const profile = useProfile();
  const progress = useProgress();
  const hasPreTest = hasTakenPreTest(progress);

  const tiles: Tile[] = [
    {
      href: hasPreTest ? "/lessons" : "/pre-test",
      title: hasPreTest ? "Lessons: continue learning" : "Start the pre-test",
      body: hasPreTest
        ? "Review concepts, visuals, and guided examples before playing."
        : "Take the pre-test to unlock the full game.",
      cta: hasPreTest ? "Open lesson list" : "Take the pre-test",
      icon: "📚",
      accent: "mint",
    },
    {
      href: "/games",
      title: "Games: choose a mode",
      body: "Practice conversions through timed, memory, defense, and quiz modes.",
      cta: "Choose a game mode",
      icon: "🎮",
      accent: "coral",
    },
    {
      href: "/how-to-play",
      title: "Guide: rules and scoring",
      body: "See how XP, streak bonuses, badges, and game scoring work.",
      cta: "Read rules and scoring",
      icon: "📖",
      accent: "sky",
    },
    {
      href: "/post-test",
      title: "Post-test: measure growth",
      body: "Compare your final score against your pre-test baseline.",
      cta: "Start post-test quiz",
      icon: "🎯",
      accent: "coral",
    },
  ];
  const analysis = buildAnalysis(progress);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-card">
        <div className="grid gap-5 md:grid-cols-[1fr_360px] md:items-center">
          <div>
            <span className="chip chip-gold">Dashboard</span>
            <h1 className="mt-3 font-display text-3xl font-black">
              Welcome back, {profile.username}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-[var(--text-muted)]">
              Track your lessons, scores, speed, and accuracy from one place.
            </p>
          </div>
          <XPBar
            xp={profile.xp}
            current={profile.xpRange.current}
            next={profile.xpRange.next}
            level={profile.level}
          />
        </div>
      </section>

      <section>
        <h2 className="section-title">Pick your next step</h2>
        <div className="grid gap-4 md:grid-cols-3 mt-4">
          {tiles.map((t, i) => (
            <motion.div
              key={t.href + t.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link
                href={t.href}
                className="tile block group"
                aria-label={t.cta}
              >
                <div className={`tile-accent ${ACCENT_BAR[t.accent]}`} />
                <div className="text-3xl">{t.icon}</div>
                <h3 className="mt-3 font-display font-extrabold text-lg">{t.title}</h3>
                <p className="mt-1 text-base text-[var(--text-muted)]">{t.body}</p>
                <span
                  className={`mt-4 inline-flex rounded-xl bg-[var(--surface-2)] px-3 py-2 text-base font-extrabold ${ACCENT_CTA[t.accent]} group-hover:underline`}
                >
                  {t.cta}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold">Performance analysis</h2>
            <p className="mt-1 text-base text-[var(--text-muted)]">
              Scores, accuracy, and speed update as you play.
            </p>
          </div>
          <span className="chip chip-sky">{analysis.status}</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {analysis.metrics.map((metric) => (
            <PerformanceMetric
              key={metric.label}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
            />
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="text-sm font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
            Recommended next move
          </div>
          <p className="mt-1 text-base font-bold">{analysis.recommendation}</p>
        </div>
      </section>

      <section className="card">
        <h2 className="font-display text-xl font-extrabold mb-4">Badges</h2>
        {profile.achievements.length === 0 ? (
          <div className="rounded-xl bg-[var(--surface-2)] border border-dashed border-[var(--border)] px-4 py-6 text-center">
            <div className="text-3xl mb-2">🎖️</div>
            <p className="text-base text-[var(--text-muted)]">
              No badges yet. Play a game to earn your first!
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {profile.achievements.map((a) => (
              <div
                key={a.code}
                className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[var(--gold)] text-white text-lg">
                    🏅
                  </span>
                  <div className="text-base font-bold">{a.title}</div>
                </div>
                <div className="text-sm text-[var(--text-muted)] mt-2">
                  {a.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type Metric = {
  label: string;
  value: string;
  detail: string;
};

function buildAnalysis(progress: ReturnType<typeof useProgress>): {
  status: string;
  metrics: Metric[];
  recommendation: string;
} {
  const pre = latestAttempt(progress.quizAttempts, "PRE_TEST");
  const post = latestAttempt(progress.quizAttempts, "POST_TEST");
  const gameScores = progress.gameScores;
  const challengeScores = gameScores.filter(
    (score) => score.mode === "CONVERSION_CHALLENGE"
  );
  const latestChallenge = challengeScores[0];
  const previousChallenge = challengeScores[1];
  const bestGame = maxBy(gameScores, (score) => score.score);
  const avgGameScore = gameScores.length
    ? Math.round(gameScores.reduce((sum, score) => sum + score.score, 0) / gameScores.length)
    : null;
  const challengeMeta = latestChallenge?.meta ?? {};
  const latestAccuracy = readNumber(challengeMeta.accuracy);
  const averageAnswerSeconds = readNumber(challengeMeta.averageAnswerSeconds);
  const trend =
    latestChallenge && previousChallenge
      ? latestChallenge.score - previousChallenge.score
      : null;
  const improvement = pre && post ? post.score - pre.score : null;
  const weakest = weakestTopic(post ?? pre);
  const lesson = weakest ? lessonForTopic(weakest) : null;

  const metrics: Metric[] = [
    {
      label: "Pre-test",
      value: pre ? `${pre.score}%` : "Not taken",
      detail: pre ? `${pre.correctCount}/${pre.totalItems} correct` : "Start here to set a baseline.",
    },
    {
      label: "Post-test",
      value: post ? `${post.score}%` : "Pending",
      detail:
        improvement == null
          ? "Take it after lessons and games."
          : `${improvement >= 0 ? "+" : ""}${improvement} percentage points from pre-test.`,
    },
    {
      label: "Best game score",
      value: bestGame ? `${bestGame.score}` : "No games yet",
      detail: avgGameScore == null ? "Play a mode to create a trend." : `Average score: ${avgGameScore}.`,
    },
    {
      label: "Conversion speed",
      value: averageAnswerSeconds == null ? "No timing yet" : `${averageAnswerSeconds}s`,
      detail:
        latestAccuracy == null
          ? "Conversion Challenge records speed and accuracy."
          : `${latestAccuracy}% accuracy${trend == null ? "." : `, ${formatTrend(trend)} last round.`}`,
    },
  ];

  let recommendation = "Take the pre-test first so the dashboard can compare growth.";
  if (pre) {
    recommendation = lesson
      ? `Review ${lesson.title}, then play Conversion Challenge to practice ${weakest?.toLowerCase()} conversions.`
      : "Play Conversion Challenge to build speed, then return for the post-test.";
  }
  if (latestAccuracy != null && latestAccuracy < 70) {
    recommendation =
      "Slow down and use the rule shown in Conversion Challenge. Aim for 80% accuracy before chasing speed.";
  } else if (averageAnswerSeconds != null && averageAnswerSeconds > 8) {
    recommendation =
      "Practice the grouping shortcuts for binary, octal, and hex to bring average response time under 8 seconds.";
  } else if (post && improvement != null && improvement > 0) {
    recommendation =
      "Nice upward trend. Keep rotating between lessons and timed rounds to protect both accuracy and speed.";
  }

  return {
    status: gameScores.length || pre || post ? "Personalized" : "Waiting for data",
    metrics,
    recommendation,
  };
}

function latestAttempt(
  attempts: QuizAttempt[],
  kind: QuizAttempt["kind"]
): QuizAttempt | null {
  return attempts.find((attempt) => attempt.kind === kind) ?? null;
}

function maxBy<T>(items: T[], pick: (item: T) => number): T | null {
  if (items.length === 0) return null;
  return items.reduce((best, item) => (pick(item) > pick(best) ? item : best));
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function weakestTopic(attempt: QuizAttempt | null): string | null {
  if (!attempt) return null;
  return (
    Object.entries(attempt.topicBreakdown).sort((a, b) => a[1] - b[1])[0]?.[0] ??
    null
  );
}

function lessonForTopic(topic: string) {
  return LESSONS.find(
    (lesson) =>
      lesson.topic === topic ||
      (topic === "HEXADECIMAL" && lesson.topic === "HEXADECIMAL")
  );
}

function formatTrend(trend: number): string {
  if (trend > 0) return `up ${trend} points from your`;
  if (trend < 0) return `down ${Math.abs(trend)} points from your`;
  return "same score as your";
}

function PerformanceMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="text-sm font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-black">{value}</div>
      <p className="mt-1 text-base text-[var(--text-muted)]">{detail}</p>
    </div>
  );
}
