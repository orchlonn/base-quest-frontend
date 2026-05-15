"use client";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Question = {
  id: string;
  prompt: string;
  type: "MULTIPLE_CHOICE" | "INPUT";
  choices?: string[];
  topic: string;
};

export default function PreTestPage() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api<Question[]>("/questions/pre-test", { auth: false })
      .then(setQuestions)
      .catch(console.error);
  }, []);

  if (!questions) return <p className="opacity-70">Loading pre-test…</p>;
  if (questions.length === 0) return <p>No pre-test questions available.</p>;

  const q = questions[idx];
  const done = idx >= questions.length - 1;
  const progress = ((idx + 1) / questions.length) * 100;

  async function submit() {
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
      };
      const result = await api("/quiz/pre-test/submit", { method: "POST", body: JSON.stringify(payload) });
      sessionStorage.setItem("bq_pretest_result", JSON.stringify(result));
      router.push("/lessons?from=pre-test");
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-display font-bold">Pre-Test</h1>
      <p className="opacity-75 mt-1">
        Before the game unlocks, let&apos;s see what you already know. Answers are randomized.
      </p>

      <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 mt-6">
        <div className="text-xs uppercase tracking-wider opacity-70">
          Question {idx + 1} of {questions.length} · {q.topic}
        </div>
        <div className="text-lg font-mono mt-2">{q.prompt}</div>

        {q.type === "MULTIPLE_CHOICE" ? (
          <div className="mt-4 grid gap-2">
            {q.choices?.map((c) => (
              <button
                key={c}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: c }))}
                className={`text-left rounded-xl border px-4 py-3 font-mono ${
                  answers[q.id] === c
                    ? "border-cyan-300 bg-cyan-300/10"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        ) : (
          <input
            className="input mt-4 font-mono"
            placeholder="Type your answer"
            value={answers[q.id] ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
          />
        )}

        <div className="mt-6 flex justify-between">
          <button
            className="ghost-btn"
            disabled={idx === 0}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
          >
            Back
          </button>
          {done ? (
            <button className="neon-btn" disabled={submitting || !answers[q.id]} onClick={submit}>
              {submitting ? "Submitting…" : "Submit pre-test"}
            </button>
          ) : (
            <button
              className="neon-btn"
              disabled={!answers[q.id]}
              onClick={() => setIdx((i) => i + 1)}
            >
              Next
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
