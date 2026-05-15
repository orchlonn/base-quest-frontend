type Accent = "sky" | "gold" | "mint" | "lilac" | "coral";

const ACCENT_BG: Record<Accent, string> = {
  sky: "bg-[var(--sky)]",
  gold: "bg-[var(--gold)]",
  mint: "bg-[var(--mint)]",
  lilac: "bg-[var(--lilac)]",
  coral: "bg-[var(--coral)]",
};

export default function HowToPlayPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <span className="chip chip-sky">📖 How to Play</span>
        <h1 className="section-title mt-3">Everything you need to know</h1>
        <p className="section-sub mt-1">
          Climb from Beginner Bit to Conversion Wizard.
        </p>
      </header>

      <Section title="Game rules" icon="📋" accent="sky">
        <ul className="list-disc list-inside text-sm space-y-1.5">
          <li>Take the pre-test once before unlocking the full game.</li>
          <li>Open lessons and play any of the four game modes.</li>
          <li>
            Finish the post-test to compare scores and see your improvement.
          </li>
        </ul>
      </Section>

      <Section title="Scoring & XP" icon="⭐" accent="gold">
        <ul className="list-disc list-inside text-sm space-y-1.5">
          <li>Each correct answer in a game adds points to your score.</li>
          <li>You earn 1 XP per score point (capped at 500 XP per game).</li>
          <li>Post-test awards 15 XP per correct answer.</li>
        </ul>
      </Section>

      <Section title="Levels" icon="🎚" accent="mint">
        <p className="text-sm leading-relaxed">
          Levels scale quadratically: level <em>n</em> requires{" "}
          <code className="font-mono bg-[var(--surface-2)] px-1.5 py-0.5 rounded">
            100·n²
          </code>{" "}
          XP. That means level 2 is 100 XP, level 3 is 400 XP, level 4 is 900
          XP, and so on.
        </p>
      </Section>

      <Section title="Streaks" icon="🔥" accent="coral">
        <ul className="list-disc list-inside text-sm space-y-1.5">
          <li>A streak is consecutive correct answers in one round.</li>
          <li>Higher streaks unlock badges (5 → Hot Streak, 10 → On Fire).</li>
          <li>One wrong answer resets the streak — but not your score.</li>
        </ul>
      </Section>

      <Section title="Badges & ranks" icon="🎖️" accent="lilac">
        <ul className="text-sm space-y-2">
          <li className="flex items-center justify-between">
            <span>
              <strong>Beginner Bit</strong>
            </span>
            <span className="chip chip-mint">0 XP</span>
          </li>
          <li className="flex items-center justify-between">
            <span>
              <strong>Binary Explorer</strong>
            </span>
            <span className="chip chip-sky">250 XP</span>
          </li>
          <li className="flex items-center justify-between">
            <span>
              <strong>Hex Hero</strong>
            </span>
            <span className="chip chip-gold">750 XP</span>
          </li>
          <li className="flex items-center justify-between">
            <span>
              <strong>Conversion Wizard</strong>
            </span>
            <span className="chip chip-lilac">2000 XP</span>
          </li>
        </ul>
      </Section>

      <Section title="Game mode rules" icon="🎮" accent="mint">
        <div className="space-y-3 text-sm">
          <p>
            <strong className="text-[var(--mint-dark)]">
              Conversion Challenge:
            </strong>{" "}
            Solve as many conversions as you can. Each correct answer gives 10
            points + streak bonus. Wrong answers break your streak.
          </p>
          <p>
            <strong className="text-[var(--coral-dark)]">
              Tower Defense:
            </strong>{" "}
            Enemies march toward your base. Type the correct conversion to fire
            a shot. Base health 100 — survive as long as you can.
          </p>
          <p>
            <strong className="text-[var(--lilac-dark)]">Memory Match:</strong>{" "}
            Flip cards to match equivalent values across bases (e.g.,{" "}
            <code className="font-mono bg-[var(--surface-2)] px-1.5 py-0.5 rounded">
              1010
            </code>{" "}
            ↔{" "}
            <code className="font-mono bg-[var(--surface-2)] px-1.5 py-0.5 rounded">
              A
            </code>{" "}
            ↔{" "}
            <code className="font-mono bg-[var(--surface-2)] px-1.5 py-0.5 rounded">
              10
            </code>
            ). Fewer flips = higher score.
          </p>
          <p>
            <strong className="text-[var(--sky-dark)]">
              Speed Quiz Arena:
            </strong>{" "}
            60 seconds. Multiple-choice conversions. Points scale with speed and
            accuracy.
          </p>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon: string;
  accent: Accent;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`h-10 w-10 rounded-full ${ACCENT_BG[accent]} text-white grid place-items-center text-lg`}
        >
          {icon}
        </div>
        <h2 className="font-display text-xl font-extrabold">{title}</h2>
      </div>
      {children}
    </section>
  );
}
