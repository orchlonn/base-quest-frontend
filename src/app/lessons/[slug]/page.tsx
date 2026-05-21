"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toBase } from "@/lib/convert";
import Link from "next/link";
import { getLessonBySlug } from "@/lib/data";

export default function LessonDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    return (
      <div className="card text-[var(--text-muted)]">
        Lesson not found.{" "}
        <Link href="/lessons" className="font-bold text-[var(--mint-dark)] hover:underline">
          Back to lessons
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div>
          <span className="chip chip-sky">{lesson.topic}</span>
          <h1 className="text-3xl md:text-4xl font-display font-black mt-3">
            {lesson.title}
          </h1>
        </div>

        <article className="card">
          <LessonArticle content={lesson.content} />
        </article>

        <div className="flex justify-between gap-3 flex-wrap">
          <Link className="btn-secondary" href="/lessons">
            ← All lessons
          </Link>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <LessonVisual topic={lesson.topic} slug={lesson.slug} />
        <InteractivePractice />
      </aside>
    </div>
  );
}

function LessonArticle({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("# ")) {
      nodes.push(
        <h2 key={i} className="font-display text-2xl font-black">
          {line.slice(2)}
        </h2>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={i} className="pt-4 font-display text-xl font-extrabold">
          {line.slice(3)}
        </h3>
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      i--;
      nodes.push(
        <ul key={i} className="list-disc space-y-2 pl-6 text-base leading-7">
          {items.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      i--;
      nodes.push(
        <ol key={i} className="list-decimal space-y-2 pl-6 text-base leading-7">
          {items.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    nodes.push(
      <p key={i} className="text-base leading-7 text-[var(--text-muted)]">
        {renderInline(line)}
      </p>
    );
  }

  return <div className="space-y-4">{nodes}</div>;
}

function renderInline(text: string) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${i}`}
          className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-mono font-bold text-[var(--text)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${i}`} className="font-extrabold text-[var(--text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function LessonVisual({ topic, slug }: { topic: string; slug: string }) {
  if (slug === "binary-basics") {
    return (
      <VisualShell title="Binary place values" chip="1011 = 11">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            ["8", "1"],
            ["4", "0"],
            ["2", "1"],
            ["1", "1"],
          ].map(([place, digit]) => (
            <div key={place} className="rounded-xl bg-[var(--mint-soft)] p-3">
              <div className="text-sm font-bold text-[var(--mint-dark)]">{place}</div>
              <div className="mt-1 font-mono text-2xl font-black">{digit}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-base text-[var(--text-muted)]">
          Add the places with a 1: 8 + 2 + 1.
        </p>
      </VisualShell>
    );
  }

  if (slug === "hex-fundamentals") {
    return (
      <VisualShell title="Hex maps to 4 bits" chip="2F">
        <div className="grid gap-2">
          <BitMap from="2" to="0010" tone="lilac" />
          <BitMap from="F" to="1111" tone="lilac" />
        </div>
        <p className="mt-3 text-base text-[var(--text-muted)]">
          One hex digit is always one 4-bit group.
        </p>
      </VisualShell>
    );
  }

  if (slug === "octal-overview") {
    return (
      <VisualShell title="Octal maps to 3 bits" chip="52">
        <div className="grid gap-2">
          <BitMap from="5" to="101" tone="coral" />
          <BitMap from="2" to="010" tone="coral" />
        </div>
        <p className="mt-3 text-base text-[var(--text-muted)]">
          Group binary in threes when octal is involved.
        </p>
      </VisualShell>
    );
  }

  if (slug === "conversion-mastery") {
    return (
      <VisualShell title="Universal route" chip="source -> target">
        <div className="grid gap-2">
          <RouteStep label="Source base" />
          <RouteStep label="Decimal bridge" />
          <RouteStep label="Target base" />
        </div>
        <p className="mt-3 text-base text-[var(--text-muted)]">
          When a direct trick is not obvious, decimal is the reliable bridge.
        </p>
      </VisualShell>
    );
  }

  return (
    <VisualShell title="Place-value pattern" chip={topic}>
      <div className="grid grid-cols-4 gap-2 text-center">
        {["base^3", "base^2", "base^1", "base^0"].map((place) => (
          <div key={place} className="rounded-xl bg-[var(--sky-soft)] p-3">
            <div className="font-mono text-sm font-black text-[var(--sky-dark)]">
              {place}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-base text-[var(--text-muted)]">
        Every base uses the same place-value structure.
      </p>
    </VisualShell>
  );
}

function VisualShell({
  title,
  chip,
  children,
}: {
  title: string;
  chip: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card relative overflow-hidden">
      <div className="tile-accent bg-[var(--sky)]" />
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold">{title}</h2>
        <span className="chip chip-sky font-mono">{chip}</span>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BitMap({
  from,
  to,
  tone,
}: {
  from: string;
  to: string;
  tone: "lilac" | "coral";
}) {
  const chip = tone === "lilac" ? "chip-lilac" : "chip-coral";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
      <span className={`chip ${chip} font-mono`}>{from}</span>
      <span className="text-sm font-black text-[var(--text-muted)]">becomes</span>
      <span className="font-mono text-lg font-black">{to}</span>
    </div>
  );
}

function RouteStep({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-center font-bold">
      {label}
    </div>
  );
}

function InteractivePractice() {
  const [n, setN] = useState(13);
  const [guess, setGuess] = useState("");
  const correct = guess === toBase(n, 2);
  const attempted = guess.length > 0;

  return (
    <section className="card relative">
      <div className="tile-accent bg-[var(--mint)]" />
      <div className="flex items-center gap-2">
        <span className="text-2xl">🧪</span>
        <h2 className="font-display text-lg font-extrabold">Try it</h2>
      </div>
      <p className="text-base text-[var(--text-muted)] mt-2">
        Convert{" "}
        <span className="font-mono font-bold text-[var(--text)]">{n}</span>{" "}
        (decimal) into binary.
      </p>
      <div className="mt-3 space-y-2">
        <input
          className="input font-mono"
          placeholder="binary…"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
        />
        <button
          className="btn-secondary w-full"
          onClick={() => {
            setN(Math.floor(Math.random() * 250) + 1);
            setGuess("");
          }}
        >
          🎲 New number
        </button>
      </div>
      {attempted && (
        <div
          className={`mt-3 rounded-xl px-3 py-2 text-base font-bold ${
            correct
              ? "bg-[var(--mint-soft)] text-[var(--mint-dark)]"
              : "bg-[var(--coral-soft)] text-[var(--coral-dark)]"
          }`}
        >
          {correct
            ? `Correct! ${n} = ${toBase(n, 2)} in binary.`
            : "Not quite — keep trying."}
        </div>
      )}
    </section>
  );
}
