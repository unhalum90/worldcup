import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

type Post = {
  id: string;
  title: string;
  summary: string;
  category: "Travel" | "City Guides" | "Matchday" | "Community";
  date: string;
  readTime: string;
  image: string;
};

const CATEGORIES: Post["category"][] = [
  "Travel",
  "City Guides",
  "Matchday",
  "Community",
];

// Placeholder posts (wireframe holder; no data source yet)
const posts: Post[] = [
  {
    id: "1",
    title: "Top tips for booking early flights to host cities",
    summary:
      "Save on airfare and arrive stress‑free with these planning strategies.",
    category: "Travel",
    date: "2025-10-01",
    readTime: "4 min",
    image: "/window.svg",
  },
  {
    id: "2",
    title: "Dallas fan guide: stadium area essentials",
    summary:
      "Where to eat, how to move, and what to expect around the venue.",
    category: "City Guides",
    date: "2025-10-02",
    readTime: "6 min",
    image: "/file.svg",
  },
  {
    id: "3",
    title: "Meetups 101: organizing safe and fun gatherings",
    summary:
      "Step‑by‑step for setting up fan meetups and getting the word out.",
    category: "Community",
    date: "2025-10-03",
    readTime: "5 min",
    image: "/next.svg",
  },
  {
    id: "4",
    title: "Matchday checklist for first‑timers",
    summary:
      "From tickets to transport, a quick rundown for a smooth experience.",
    category: "Matchday",
    date: "2025-10-04",
    readTime: "3 min",
    image: "/globe.svg",
  },
  {
    id: "5",
    title: "Toronto weekend itinerary for fans",
    summary:
      "Make the most of your off‑days with these picks close to transit.",
    category: "City Guides",
    date: "2025-10-05",
    readTime: "7 min",
    image: "/vercel.svg",
  },
  {
    id: "6",
    title: "Travel hacks for multi‑city trips",
    summary:
      "A practical approach to stringing matches across borders and time zones.",
    category: "Travel",
    date: "2025-10-06",
    readTime: "8 min",
    image: "/window.svg",
  },
];

export default async function BlogPage() {
  const t = await getTranslations("blog");

  return (
    <div className="container mt-8 sm:mt-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
          {t("title")}
        </h1>
        <p className="mt-2 text-[color:var(--color-neutral-800)]">
          {/* Optional helper text; keep minimal for wireframe */}
          {/* Later: explain categories and link to newsletter */}
        </p>
      </header>

      {/* Filters/search/sort (non-functional placeholders) */}
      <div
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        aria-label="Filters (placeholder)"
      >
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span key={c} className="chip cursor-default select-none">
              {c}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search (coming soon)"
            disabled
            className="border rounded-md px-3 py-2 border-[color:var(--color-neutral-100)] bg-[color:var(--color-neutral-100)]/40 text-[color:var(--color-neutral-800)]"
          />
          <select
            disabled
            className="border rounded-md px-2 py-2 border-[color:var(--color-neutral-100)] bg-[color:var(--color-neutral-100)]/40 text-[color:var(--color-neutral-800)]"
          >
            <option>Sort: Newest</option>
          </select>
        </div>
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <p className="text-[color:var(--color-neutral-800)]">{t("empty")}</p>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-[var(--radius-md)] overflow-hidden border border-[color:var(--color-neutral-100)] bg-white shadow-sm flex flex-col"
            >
              <div className="aspect-[16/9] bg-[color:var(--color-neutral-100)] flex items-center justify-center">
                <Image
                  src={post.image}
                  alt=""
                  width={640}
                  height={360}
                  className="w-20 h-20 opacity-70"
                />
              </div>
              <div className="p-4 sm:p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="chip">{post.category}</span>
                  <span className="text-xs text-[color:var(--color-neutral-800)]">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-[color:var(--color-neutral-800)]">
                    • {post.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-sm text-[color:var(--color-neutral-800)]">
                  {post.summary}
                </p>
                <div className="mt-2">
                  {/* Wireframe: link goes nowhere yet */}
                  <Link
                    href="#"
                    className="text-sm font-medium underline underline-offset-4 text-[color:var(--color-primary)]"
                    aria-disabled
                    onClick={(e) => e.preventDefault()}
                  >
                    Read more (soon)
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination (disabled placeholder) */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          disabled
          className="px-3 py-2 border rounded-md border-[color:var(--color-neutral-100)] bg-[color:var(--color-neutral-100)]/40 text-[color:var(--color-neutral-800)]"
        >
          Previous
        </button>
        <button
          disabled
          className="px-3 py-2 border rounded-md border-[color:var(--color-neutral-100)] bg-[color:var(--color-neutral-100)]/40 text-[color:var(--color-neutral-800)]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
