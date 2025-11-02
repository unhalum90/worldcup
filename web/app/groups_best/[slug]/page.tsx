import fs from "fs";
import path from "path";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

const GROUPS_BEST_DIR = path.join(process.cwd(), "app/groups_best");

const slugToCity = (slug: string) =>
  slug
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  if (!fs.existsSync(GROUPS_BEST_DIR)) {
    return [];
  }

  return fs
    .readdirSync(GROUPS_BEST_DIR)
    .filter((file) => file.endsWith("_best.md"))
    .map((file) => {
      const raw = file.replace("_best.md", "");
      return {
        slug: raw.replace(/_/g, "-"),
      };
    });
}

export async function generateMetadata({ params }: RouteParams) {
  const { slug } = await params;
  const city = slugToCity(slug);

  return {
    title: `Best (and Worst) of ${city} - World Cup 2026 | WC26 Fan Zone`,
    description: `Quick guide to ${city} for the World Cup 2026 - where to stay, what to avoid, and how to plan smarter as a fan.`,
    alternates: {
      canonical: `https://worldcup26fanzone.com/groups_best/${slug}`,
    },
  };
}

const readCityMarkdown = (slug: string): string | null => {
  const normalized = slug.replace(/-/g, "_");
  const filePath = path.join(GROUPS_BEST_DIR, `${normalized}_best.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, "utf-8");
};

const extractSections = (markdown: string) => {
  type SectionKey = "intro" | "best" | "worst" | "outro";
  const buckets: Record<SectionKey, string[]> = {
    intro: [],
    best: [],
    worst: [],
    outro: [],
  };

  let current: SectionKey = "intro";
  const lines = markdown.split(/\r?\n/);

  lines.forEach((line) => {
    const trimmedLower = line.trim().toLowerCase();

    if (trimmedLower.startsWith("the best")) {
      current = "best";
    } else if (
      trimmedLower.startsWith("the (honest) worst") ||
      trimmedLower.startsWith("the worst")
    ) {
      current = "worst";
    } else if (
      trimmedLower.startsWith("get the full") ||
      trimmedLower.startsWith("download the full") ||
      trimmedLower.startsWith("->")
    ) {
      current = "outro";
    }

    buckets[current].push(line);
  });

  const toSection = (lines: string[]) => {
    const copy = [...lines];
    while (copy.length && copy[0].trim() === "") {
      copy.shift();
    }
    if (!copy.length) {
      return null;
    }

    const headingLine = copy.shift()?.trim() ?? "";
    const heading = headingLine.replace(/^#+\s*/, "");
    const body = copy.join("\n").trim();

    return {
      heading,
      body,
    };
  };

  const intro = buckets.intro.join("\n").trim();
  const best = toSection(buckets.best);
  const worst = toSection(buckets.worst);
  const outro = buckets.outro.join("\n").trim();

  return { intro, best, worst, outro };
};

const proseClasses =
  "prose prose-lg max-w-none text-neutral-800 [&_strong]:text-neutral-900 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-700";

const formatCardCopy = (markdown: string) => {
  return markdown
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return "";
      }

      const leadMatch = trimmed.match(/^([^:*]+?):\s*(.+)$/);
      if (leadMatch) {
        const lead = leadMatch[1].trim();
        const rest = leadMatch[2].trim();
        return `**${lead}**: ${rest}`;
      }

      return trimmed;
    })
    .filter(Boolean)
    .join("\n\n");
};

export default async function CityBestPage({ params }: RouteParams) {
  const { slug } = await params;
  const markdown = readCityMarkdown(slug);

  if (!markdown) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Guide coming soon</h1>
        <p className="mt-4 text-neutral-600">
          We&apos;re finishing the travel intel for this city. Check back shortly or explore the full group analysis.
        </p>
        <Link
          href="/groups"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
        >
          Explore group guides
        </Link>
      </main>
    );
  }

  const city = slugToCity(slug);
  const { intro, best, worst, outro } = extractSections(markdown);

  const bestHeading =
    best?.heading || `Best moves for fans in ${city}`;
  const worstHeading =
    worst?.heading || `What to watch out for in ${city}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <article className="mx-auto max-w-3xl space-y-10 px-6 pb-16 pt-16 text-neutral-800">
        {intro && (
          <div className={`${proseClasses} space-y-4`}>
            <ReactMarkdown>{intro}</ReactMarkdown>
          </div>
        )}

        {best?.body && (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 shadow-sm backdrop-blur-sm">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Fan Favorites
            </span>
            <h2 className="mt-4 text-2xl font-bold text-emerald-900">{bestHeading}</h2>
            <div
              className={`${proseClasses} mt-6 space-y-4 [&_li::marker]:text-emerald-600 [&_p]:leading-relaxed`}
            >
              <ReactMarkdown>{formatCardCopy(best.body)}</ReactMarkdown>
            </div>
          </section>
        )}

        {worst?.body && (
          <section className="rounded-3xl border border-rose-200 bg-rose-50/70 p-8 shadow-sm backdrop-blur-sm">
            <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-700">
              Heads up
            </span>
            <h2 className="mt-4 text-2xl font-bold text-rose-900">{worstHeading}</h2>
            <div
              className={`${proseClasses} mt-6 space-y-4 [&_li::marker]:text-rose-600 [&_p]:leading-relaxed`}
            >
              <ReactMarkdown>{formatCardCopy(worst.body)}</ReactMarkdown>
            </div>
          </section>
        )}

        {outro && (
          <div className={`${proseClasses} space-y-4`}>
            <ReactMarkdown>{outro}</ReactMarkdown>
          </div>
        )}
      </article>

      <section className="mx-auto mb-24 max-w-3xl px-6">
        <div className="rounded-3xl border border-blue-100 bg-white/80 p-10 text-center shadow-sm backdrop-blur-sm">
          <h3 className="text-3xl font-semibold text-neutral-900">Continue Your World Cup Journey</h3>
          <p className="mt-3 text-neutral-600">
            Download the premium guide or spin up a custom itinerary to make the most of your time in {city}.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href={`/store/${slug}`}
              className="inline-flex items-center justify-center rounded-full bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-800"
            >
              Download the {city} 9-page guide
            </Link>
            <Link
              href={`/trip-builder?city=${slug}`}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500"
            >
              Plan your trip with the AI Trip Builder
            </Link>
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            Explore every host city inside our{" "}
            <Link href="/groups" className="text-blue-600 underline underline-offset-4">
              Group Stage Analysis
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
