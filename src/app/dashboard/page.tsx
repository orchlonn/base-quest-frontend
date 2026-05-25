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
  mint:  "bg-[var(--mint)]",
  coral: "bg-[var(--coral)]",
  gold:  "bg-[var(--gold)]",
  sky:   "bg-[var(--sky)]",
  lilac: "bg-[var(--lilac)]",
};

const ACCENT_CTA: Record<Tile["accent"], string> = {
  mint:  "text-[var(--mint-dark)]",
  coral: "text-[var(--coral-dark)]",
  gold:  "text-[var(--gold-dark)]",
  sky:   "text-[var(--sky-dark)]",
  lilac: "text-[var(--lilac-dark)]",
};

const ACCENT_SOFT: Record<Tile["accent"], string> = {
  mint:  "bg-[var(--mint-soft)]",
  coral: "bg-[var(--coral-soft)]",
  gold:  "bg-[var(--gold-soft)]",
  sky:   "bg-[var(--sky-soft)]",
  lilac: "bg-[var(--lilac-soft)]",
};

export default function DashboardPage() {
  const profile = useProfile();
  const progress = useProgress();
  const hasPreTest = hasTakenPreTest(progress);

  const tiles: Tile[] = [
    {
      href: hasPreTest ? "/lessons" : "/pre-test",
      title: hasPreTest ? "Study the lessons" : "Take the pre-test first",
      body: hasPreTest
        ? "Read explanations, view visual diagrams, and practice conversions before playing."
        : "The pre-test measures your baseline knowledge and unlocks all game modes.",
      cta: hasPreTest ? "Open lesson list" : "Begin pre-test",
      icon: "📚",
      accent: "mint",
    },
    {
      href: "/games",
      title: "Play a game mode",
      body: "Practice conversions in timed, memory, defense, and multiple-choice formats.",
      cta: "Browse game modes",
      icon: "🎮",
      accent: "coral",
    },
    {
      href: "/how-to-play",
      title: "Read the rules and scoring",
      body: "Learn how XP, streaks, difficulty levels, and badges work before you play.",
      cta: "View rules guide",
      icon: "📖",
      accent: "sky",
    },
    {
      href: "/post-test",
      title: "Measure your growth",
      body: "Take the post-test to see how much your score improved since the pre-test.",
      cta: "Start post-test",
      icon: "🎯",
      accent: "coral",
    },
  ];

  const analysis = buildAnalysis(progress);

  return (
    <div className="space-y-8">
      {/* Hero / XP section */}
      <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-card">
        <div className="grid gap-5 md:grid-cols-[1fr_360px] md:items-center">
          <div>
            <span className="chip chip-gold">Dashboard</span>
            <h1 className="mt-3 font-display text-3xl font-black">
              Welcome back, {profile.username}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-[var(--text-muted)]">
              Track your lessons, game scores, speed, and accuracy from one place.
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

      {/* Action tiles */}
      <section>
        <h2 className="section-title">What do you want to do next?</h2>
        <p className="section-sub mt-1">Each tile goes to a different part of the app.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
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
                className="tile block group h-full"
                aria-label={t.cta}
              >
                <div className={`tile-accent ${ACCENT_BAR[t.accent]}`} />
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${ACCENT_SOFT[t.accent]}`}>
                  {t.icon}
                </div>
                <h3 className="mt-3 font-display font-extrabold text-base leading-snug">{t.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--text-muted)] leading-relaxed">{t.body}</p>
                <span
                  className={`mt-4 inline-flex items-center gap-1 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm font-extrabold ${ACCENT_CTA[t.accent]} group-hover:underline`}
                >
                  {t.cta} →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Performance analysis */}
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

        {/* Key metrics */}
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

        {/* Topic breakdown */}
        {analysis.topicBreakdown && analysis.topicBreakdown.length > 0 && (
          <div className="mt-5">
            <div className="text-sm font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-3">
              Topic accuracy (latest quiz)
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {analysis.topicBreakdown.map(({ topic, ratio }) => (
                <TopicBar key={topic} topic={topic} ratio={ratio} />
              ))}
            </div>
          </div>
        )}

        {/* Timing trend */}
        {analysis.timingTrend && (
          <div className="mt-5">
            <div className="text-sm font-extrabold uppercase tracking-wide text-[var(--text-muted)] mb-3">
              Conversion challenge timing (last 3 sessions)
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.timingTrend.map((session, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center min-w-[80px]"
                >
                  <div className="text-xs font-bold text-[var(--text-muted)]">
                    Session {analysis.timingTrend!.length - i}
                  </div>
                  <div className="font-mono text-lg font-black">{session.avg}s</div>
                  <div className="text-xs text-[var(--text-muted)]">{session.accuracy}% acc</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="text-sm font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
            Recommended next move
          </div>
          <p className="mt-1 text-base font-bold">{analysis.recommendation}</p>
        </div>
      </section>

      {/* Badges */}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

type Metric = {
  label: string;
  value: string;
  detail: string;
};

function PerformanceMetric({ label, value, detail }: Metric) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="text-sm font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-black">{value}</div>
      <p className="mt-1 text-sm text-[var(--text-muted)] leading-relaxed">{detail}</p>
    </div>
  );
}

function TopicBar({ topic, ratio }: { topic: string; ratio: number }) {
  const pct = Math.round(ratio * 100);
  const barColor =
    pct >= 80 ? "bg-[var(--mint)]" : pct >= 50 ? "bg-[var(--gold)]" : "bg-[var(--coral)]";
  const label =
    pct >= 80
      ? "Strong"
      : pct >= 50
      ? "Developing"
      : "Needs work";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold capitalize">{topic.toLowerCase()}</span>
        <span className="text-sm font-bold text-[var(--text-muted)]">
          {pct}% · {label}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--border)]">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Analysis logic ───────────────────────────────────────────────────────────

type AnalysisResult = {
  status: string;
  metrics: Metric[];
  recommendation: string;
  topicBreakdown: { topic: string; ratio: number }[] | null;
  timingTrend: { avg: number; accuracy: number }[] | null;
};

function buildAnalysis(progress: ReturnType<typeof useProgress>): AnalysisResult {
  const pre = latestAttempt(progress.quizAttempts, "PRE_TEST");
  const post = latestAttempt(progress.quizAttempts, "POST_TEST");
  const gameScores = progress.gameScores;
  const challengeScores = gameScores.filter((s) => s.mode === "CONVERSION_CHALLENGE");
  const latestChallenge = challengeScores[0];
  const previousChallenge = challengeScores[1];
  const bestGame = maxBy(gameScores, (s) => s.score);
  const avgGameScore = gameScores.length
    ? Math.round(gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length)
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

  // Topic breakdown from most recent quiz
  const quizForBreakdown = post ?? pre;
  const topicBreakdown = quizForBreakdown
    ? Object.entries(quizForBreakdown.topicBreakdown)
        .sort((a, b) => b[1] - a[1])
        .map(([topic, ratio]) => ({ topic, ratio }))
    : null;

  // Timing trend: last 3 challenge sessions
  const timingTrend =
    challengeScores.length >= 2
      ? challengeScores
          .slice(0, 3)
          .reverse()
          .map((s) => ({
            avg: readNumber(s.meta?.averageAnswerSeconds) ?? 0,
            accuracy: readNumber(s.meta?.accuracy) ?? 0,
          }))
      : null;

  const metrics: Metric[] = [
    {
      label: "Pre-test",
      value: pre ? `${pre.score}%` : "Not taken",
      detail: pre
        ? `${pre.correctCount}/${pre.totalItems} correct`
        : "Start here to set your baseline score.",
    },
    {
      label: "Post-test",
      value: post ? `${post.score}%` : "Pending",
      detail:
        improvement == null
          ? "Take it after studying lessons and playing games."
          : `${improvement >= 0 ? "+" : ""}${improvement} percentage points vs. pre-test.`,
    },
    {
      label: "Best game score",
      value: bestGame ? `${bestGame.score}` : "No games yet",
      detail:
        avgGameScore == null
          ? "Play a game mode to start building a trend."
          : `Average across all sessions: ${avgGameScore}.`,
    },
    {
      label: "Conversion speed",
      value: averageAnswerSeconds == null ? "No data yet" : `${averageAnswerSeconds}s avg`,
      detail:
        latestAccuracy == null
          ? "Conversion Challenge tracks per-question response time."
          : `${latestAccuracy}% accuracy${
              trend == null ? "." : ` · ${formatTrend(trend)} last round.`
            }`,
    },
  ];

  let recommendation =
    "Take the pre-test first — it unlocks games and sets your learning baseline.";
  if (pre) {
    recommendation = lesson
      ? `Review "${lesson.title}", then play Conversion Challenge to practice ${weakest?.toLowerCase()} conversions.`
      : "Play Conversion Challenge to build speed, then take the post-test to measure growth.";
  }
  if (latestAccuracy != null && latestAccuracy < 70) {
    recommendation =
      "Focus on accuracy before speed. Study the worked examples in Conversion Challenge, then aim for 80% before increasing difficulty.";
  } else if (averageAnswerSeconds != null && averageAnswerSeconds > 8) {
    recommendation =
      "Practice the bit-grouping shortcuts: binary ↔ hex (groups of 4), binary ↔ octal (groups of 3). These cut response time significantly.";
  } else if (post && improvement != null && improvement > 0) {
    recommendation =
      "Great improvement! Keep rotating between lessons for accuracy and timed games for speed to protect both skills.";
  }

  return {
    status: gameScores.length || pre || post ? "Personalized" : "Waiting for data",
    metrics,
    recommendation,
    topicBreakdown,
    timingTrend,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function latestAttempt(
  attempts: QuizAttempt[],
  kind: QuizAttempt["kind"]
): QuizAttempt | null {
  return attempts.find((a) => a.kind === kind) ?? null;
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
    Object.entries(attempt.topicBreakdown).sort((a, b) => a[1] - b[1])[0]?.[0] ?? null
  );
}

function lessonForTopic(topic: string) {
  return LESSONS.find(
    (l) => l.topic === topic || (topic === "HEXADECIMAL" && l.topic === "HEXADECIMAL")
  );
}

function formatTrend(trend: number): string {
  if (trend > 0) return `up ${trend} points from`;
  if (trend < 0) return `down ${Math.abs(trend)} points from`;
  return "same score as";
}
