"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { pickPreTest, type PublicQuestion } from "@/lib/data";
import { gradePreTest, type GradeResult } from "@/lib/local-progress";
import { TestFeedback } from "@/components/TestFeedback";

export default function PreTestPage() {
  const [questions, setQuestions] = useState<PublicQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);

  useEffect(() => {
    setQuestions(pickPreTest(10));
  }, []);

  if (!questions) {
    return (
      <div className="card animate-pulse">
        <p className="text-[var(--text-muted)]">Loading pre-test…</p>
      </div>
    );
  }
  if (questions.length === 0) return <p>No pre-test questions available.</p>;

  if (result) {
    return (
      <TestFeedback
        title="Pre-test complete"
        accent="mint"
        result={result}
        questions={questions}
        answers={answers}
        continueHref="/lessons?from=pre-test"
        continueLabel="Open lessons"
      />
    );
  }

  const q = questions[idx];
  const done = idx >= questions.length - 1;
  const progress = ((idx + 1) / questions.length) * 100;

  function submit() {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));
      const result = gradePreTest(payload);
      sessionStorage.setItem("bq_pretest_result", JSON.stringify(result));
      setResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <span className="chip chip-mint">Pre-test</span>
        <span className="text-base font-bold text-[var(--text-muted)]">
          Question {idx + 1} of {questions.length}
        </span>
      </div>
      <div
        className="h-3 rounded-full overflow-hidden border-2 bg-white"
        style={{ borderColor: "var(--border)" }}
      >
        <motion.div
          className="h-full"
          style={{ background: "var(--mint)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <h1 className="text-2xl md:text-3xl font-display font-black mt-6">
        Let&apos;s see what you know
      </h1>
      <p className="text-[var(--text-muted)] mt-1">
        Answers are randomized. Just pick what feels right.
      </p>

      <motion.div
        key={q.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mt-6"
      >
        <span className="chip chip-lilac">{q.topic}</span>
        <div className="font-mono text-xl md:text-2xl font-bold mt-3 break-words">
          {q.prompt}
        </div>

        {q.type === "MULTIPLE_CHOICE" ? (
          <div className="mt-5 grid gap-2.5">
            {q.choices?.map((c) => (
              <button
                key={c}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: c }))}
                className={`mc-option font-mono ${
                  answers[q.id] === c ? "is-selected" : ""
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        ) : (
          <input
            className="input mt-5 font-mono text-lg"
            placeholder="Type your answer"
            value={answers[q.id] ?? ""}
            onChange={(e) =>
              setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
            }
          />
        )}

        <div className="mt-7 flex justify-between gap-3">
          <button
            className="btn-secondary"
            disabled={idx === 0}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
          >
            ← Back
          </button>
          {done ? (
            <button
              className="btn-primary"
              disabled={submitting || !answers[q.id]}
              onClick={submit}
            >
              {submitting ? "Submitting…" : "Submit pre-test"}
            </button>
          ) : (
            <button
              className="btn-primary"
              disabled={!answers[q.id]}
              onClick={() => setIdx((i) => i + 1)}
            >
              Next →
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
