export default function HowToPlayPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold">How to Play</h1>
        <p className="opacity-75 mt-1">Everything you need to climb from Beginner Bit to Conversion Wizard.</p>
      </header>

      <Section title="Game rules">
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Take the pre-test once before unlocking the full game.</li>
          <li>Open lessons and play any of the four game modes.</li>
          <li>Finish the post-test to compare scores and see your improvement.</li>
        </ul>
      </Section>

      <Section title="Scoring & XP">
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Each correct answer in a game adds points to your score.</li>
          <li>You earn 1 XP per score point (capped at 500 XP per game).</li>
          <li>Post-test awards 15 XP per correct answer.</li>
        </ul>
      </Section>

      <Section title="Levels">
        <p className="text-sm">
          Levels scale quadratically: level <em>n</em> requires <code className="font-mono">100·n²</code> XP.
          That means level 2 is 100 XP, level 3 is 400 XP, level 4 is 900 XP, and so on.
        </p>
      </Section>

      <Section title="Streaks">
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>A streak is consecutive correct answers in one round.</li>
          <li>Higher streaks unlock badges (5 → Hot Streak, 10 → On Fire).</li>
          <li>One wrong answer resets the streak — but not your score.</li>
        </ul>
      </Section>

      <Section title="Badges & Ranks">
        <ul className="list-disc list-inside text-sm space-y-1">
          <li><strong>Beginner Bit</strong> — 0 XP. Welcome!</li>
          <li><strong>Binary Explorer</strong> — 250 XP.</li>
          <li><strong>Hex Hero</strong> — 750 XP.</li>
          <li><strong>Conversion Wizard</strong> — 2000 XP.</li>
        </ul>
      </Section>

      <Section title="Game mode rules">
        <div className="space-y-3 text-sm">
          <p><strong>Conversion Challenge:</strong> Solve as many conversions as you can. Each correct answer gives 10 points + streak bonus. Wrong answers break your streak.</p>
          <p><strong>Tower Defense:</strong> Enemies march toward your base. Type the correct conversion to fire a shot. Wrong or empty answers let them advance. Base health 100 — survive as long as you can.</p>
          <p><strong>Memory Match:</strong> Flip cards to match equivalent values across bases (e.g., <code className="font-mono">1010</code> ↔ <code className="font-mono">A</code> ↔ <code className="font-mono">10</code>). Fewer flips = higher score.</p>
          <p><strong>Speed Quiz Arena:</strong> 60 seconds. Multiple-choice conversions. Points scale with speed and accuracy.</p>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass p-6">
      <h2 className="font-display text-lg font-bold mb-2">{title}</h2>
      {children}
    </section>
  );
}
