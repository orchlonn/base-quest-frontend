"use client";

import Link from "next/link";
import { findQuestion, type PublicQuestion } from "@/lib/data";
import type { GradeResult, PostTestResult } from "@/lib/local-progress";

type Accent = "mint" | "coral";
type TestResult = GradeResult | PostTestResult;

type TestFeedbackProps = {
  title: string;
  accent: Accent;
  result: TestResult;
  questions: PublicQuestion[];
  answers: Record<string, string>;
  continueHref: string;
  continueLabel: string;
};

const CHIP_CLASS: Record<Accent, string> = {
  mint: "chip-mint",
  coral: "chip-coral",
};

const BUTTON_CLASS: Record<Accent, string> = {
  mint: "btn-primary",
  coral: "btn-coral",
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function isPostTestResult(result: TestResult): result is PostTestResult {
  return "feedback" in result;
}

export function TestFeedback({
  title,
  accent,
  result,
  questions,
  answers,
  continueHref,
  continueLabel,
}: TestFeedbackProps) {
  const topicRows = Object.entries(result.topicBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className={`chip ${CHIP_CLASS[accent]}`}>{title}</span>
            <h1 className="mt-3 font-display text-3xl font-black">
              {result.attempt.score}% score
            </h1>
            <p className="mt-1 text-base text-[var(--text-muted)]">
              {result.attempt.correctCount} of {result.attempt.totalItems} correct
            </p>
          </div>
          <Link href={continueHref} className={BUTTON_CLASS[accent]}>
            {continueLabel}
          </Link>
        </div>

        {isPostTestResult(result) && (
          <p className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-base font-bold">
            {result.feedback}
          </p>
        )}

        {topicRows.length > 0 && (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {topicRows.map(([topic, ratio]) => {
              const pct = Math.round(ratio * 100);
              const barColor =
                pct >= 80
                  ? "bg-[var(--mint)]"
                  : pct >= 50
                  ? "bg-[var(--gold)]"
                  : "bg-[var(--coral)]";
              return (
                <div
                  key={topic}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-sm font-bold capitalize">
                      {topic.toLowerCase()}
                    </span>
                    <span className="text-sm font-bold text-[var(--text-muted)]">
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--border)]">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {result.recommendedLessons.length > 0 && (
          <div className="mt-5">
            <div className="text-sm font-extrabold uppercase tracking-wide text-[var(--text-muted)]">
              Recommended lessons
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.recommendedLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.slug}`}
                  className="chip chip-sky"
                >
                  {lesson.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-extrabold">Answer review</h2>
        {questions.map((q, index) => {
          const fullQuestion = findQuestion(q.id);
          const correctAnswer = fullQuestion?.answer ?? "";
          const selected = answers[q.id] ?? "";
          const correct = normalize(selected) === normalize(correctAnswer);

          return (
            <article
              key={q.id}
              className={`rounded-2xl border bg-white p-4 shadow-card ${
                correct
                  ? "border-[var(--mint)]"
                  : "border-[var(--coral)]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`chip ${correct ? "chip-mint" : "chip-coral"}`}>
                  {correct ? "Correct" : "Review"}
                </span>
                <span className="text-sm font-bold text-[var(--text-muted)]">
                  Question {index + 1}
                </span>
              </div>
              <div className="mt-3 font-mono text-lg font-bold">{q.prompt}</div>

              {q.type === "MULTIPLE_CHOICE" ? (
                <div className="mt-4 grid gap-2">
                  {q.choices?.map((choice) => {
                    const isCorrectChoice = normalize(choice) === normalize(correctAnswer);
                    const isSelectedWrong =
                      normalize(choice) === normalize(selected) && !isCorrectChoice;
                    return (
                      <div
                        key={choice}
                        className={`mc-option pointer-events-none font-mono ${
                          isCorrectChoice
                            ? "is-correct"
                            : isSelectedWrong
                            ? "is-wrong"
                            : ""
                        }`}
                      >
                        {choice}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div
                    className={`rounded-xl border-2 px-4 py-3 ${
                      correct
                        ? "border-[var(--mint)] bg-[var(--mint-soft)] text-[var(--mint-dark)]"
                        : "border-[var(--coral)] bg-[var(--coral-soft)] text-[var(--coral-dark)]"
                    }`}
                  >
                    <div className="text-xs font-extrabold uppercase tracking-wide">
                      Your answer
                    </div>
                    <div className="mt-1 font-mono text-lg font-black break-all">
                      {selected || "Blank"}
                    </div>
                  </div>
                  {!correct && (
                    <div className="rounded-xl border-2 border-[var(--mint)] bg-[var(--mint-soft)] px-4 py-3 text-[var(--mint-dark)]">
                      <div className="text-xs font-extrabold uppercase tracking-wide">
                        Correct answer
                      </div>
                      <div className="mt-1 font-mono text-lg font-black break-all">
                        {correctAnswer}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {fullQuestion?.explanation && (
                <p className="mt-3 rounded-xl bg-[var(--surface-2)] p-3 text-sm font-bold text-[var(--text-muted)]">
                  {fullQuestion.explanation}
                </p>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
