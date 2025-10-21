import fs from 'fs';
import path from 'path';

const features = [
  {
    title: 'City Guide',
    desc: 'A complete Boston guide with neighborhood tips, transit, stadium access, and verified recommendations.',
  },
  {
    title: 'Forums',
    desc: "City-specific forums with pinned 'Start Here' threads, matchday live threads, and community Q&A.",
  },
  {
    title: 'AI Travel Builder',
    desc: 'Generate personalized day-by-day itineraries for matches, including transport, dining, and alternatives. (Photos to be provided)',
  },
];

export default function BostonDemo() {
  // Attempt to read a small summary from a local markdown file if present.
  let bostonSummary: string | null = null;
  try {
    const mdPath = path.join(process.cwd(), 'web', 'components', 'cities', 'boston.md');
    if (fs.existsSync(mdPath)) {
      const raw = fs.readFileSync(mdPath, 'utf8').trim();
      if (raw.length > 20) {
        // take the first paragraph (split on two newlines) and trim to ~240 chars
        const para = raw.split(/\n\s*\n/)[0].replace(/\n/g, ' ').trim();
        bostonSummary = para.length > 240 ? para.slice(0, 237) + '...' : para;
      }
    }
  } catch (e) {
    // ignore — fall back to static copy
  }
  return (
    <section className="container mt-12 mb-12">
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-neutral-100)] bg-white p-6 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Boston — exemplar city guide</h2>
  <p className="text-[color:var(--color-neutral-800)] mb-6">{bostonSummary ?? 'This page demonstrates the core features we will build for every host city. We will develop Boston first as the exemplar.'}</p>

        <div className="coming-soon">
          <h3 className="coming-soon__title">Coming soon</h3>
          <div className="coming-soon__items">
            {features.map((f) => (
              <div key={f.title} className="coming-soon__item">
                <h4 className="coming-soon__feature">{f.title}</h4>
                <p className="coming-soon__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
