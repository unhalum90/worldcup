import Image from 'next/image';

type Feature = {
  title: string;
  desc: string;
  img: string;
};

const features: Feature[] = [
  {
    title: 'Feature 1 — City Guide',
    desc: 'A complete Boston guide with neighborhood tips, transit, stadium access, and verified recommendations.',
    img: '/mockups/desktop_mockup_city_guide.png',
  },
  {
    title: 'Feature 2 — Forums',
    desc: "City-specific forums with pinned 'Start Here' threads, matchday live threads, and community Q&A.",
    img: '/mockups/desktop_mockup_community.png',
  },
  {
    title: 'Feature 3 — AI Travel Builder',
    desc: 'Generate personalized day-by-day itineraries for matches, including transport, dining, and alternatives. (Photos to be provided)',
    img: '/mockups/desktop_mockup_travel_plan.png',
  },
];

function FeatureRow({ f, reverse }: { f: Feature; reverse?: boolean }) {
  return (
    <div className={`md:flex md:items-center md:gap-8 py-8 ${reverse ? 'md:flex-row-reverse' : ''}`}>
      <div className="md:flex-1">
        <h3 className="text-xl font-bold mb-2">{f.title}</h3>
        <p className="text-[color:var(--color-neutral-800)]">{f.desc}</p>
      </div>
      <div className="md:w-96 mt-4 md:mt-0 flex items-center justify-center">
        <div className="w-full rounded-lg overflow-hidden border border-[color:var(--color-neutral-100)] shadow-sm">
          <Image src={f.img} alt={f.title} width={720} height={420} className="w-full h-auto object-cover" />
        </div>
      </div>
    </div>
  );
}

export default function BostonDemo() {
  return (
    <section className="container mt-12 mb-12">
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-neutral-100)] bg-white p-6 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Boston — exemplar city guide</h2>
        <p className="text-[color:var(--color-neutral-800)] mb-6">This page demonstrates the core features we will build for every host city. We will develop Boston first as the exemplar.</p>

        {features.map((f, i) => (
          <FeatureRow key={f.title} f={f} reverse={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
