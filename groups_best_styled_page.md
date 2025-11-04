# Enhanced Markdown Styling for Best/Worst Pages

## File: /app/groups/groups_best/[slug]/page.tsx

```tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import Link from "next/link";

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "app/groups/groups_best");
  const files = fs.readdirSync(dir);
  return files
    .filter((file) => file.endsWith("_best.md"))
    .map((file) => ({
      slug: file.replace("_best.md", ""),
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const city = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  return {
    title: `Best (and Worst) of ${city} – World Cup 2026 | WC26 Fan Zone`,
    description: `Quick guide to ${city} for the World Cup 2026 — where to stay, what to avoid, and how to plan smarter as a fan.`,
  };
}

export default async function CityBestPage({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), "app/groups/groups_best", `${params.slug}_best.md`);
  const file = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(file);

  // Add styled background blocks for Best/Worst sections
  let formatted = content
    .replace("The Best Of:", '<div class="bg-green-50 border-l-4 border-green-600 px-6 py-4 rounded-lg mb-8"><h2>The Best Of:</h2>')
    .replace("The Worst Of:", '</div><div class="bg-red-50 border-l-4 border-red-600 px-6 py-4 rounded-lg mt-12"><h2>The Worst Of:</h2>')
    + "</div>";

  const html = marked.parse(formatted);
  const city = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
      <article
        className="prose prose-lg mx-auto text-gray-800 leading-relaxed
                   prose-h1:text-3xl prose-h1:font-bold prose-h1:text-[#0C4A6E]
                   prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-gray-900
                   prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:leading-snug
                   prose-li:marker:text-[#0C4A6E] prose-a:text-blue-700 prose-a:underline hover:prose-a:text-blue-800
                   prose-headings:mt-10 prose-headings:mb-4 prose-ul:mt-4 prose-ul:mb-8 prose-hr:my-12
                   prose-p:first-of-type:text-lg prose-p:first-of-type:text-gray-900 prose-p:first-of-type:font-medium"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* --- CTA Section --- */}
      <section className="mt-16">
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white shadow-sm px-8 py-10 text-center">
          <h3 className="text-3xl font-semibold text-gray-900 mb-4">
            Continue Your World Cup Journey
          </h3>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Download the premium guide or spin up a custom itinerary to make the most of your time in {city}.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link
              href={`/store/${params.slug}`}
              className="inline-block bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-medium shadow hover:bg-blue-800 hover:shadow-md transition-all duration-200"
            >
              📘 Download the {city} 9-Page Guide
            </Link>

            <Link
              href={`/trip-builder?city=${params.slug}`}
              className="inline-block bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-medium shadow hover:bg-green-700 hover:shadow-md transition-all duration-200"
            >
              ✈️ Plan Your Trip with the AI Trip Builder
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Explore every host city inside our{" "}
            <Link href="/groups" className="text-blue-600 font-medium underline hover:text-blue-700">
              Group Stage Analysis
            </Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
```


UPDATES

/* -----------------------------------------
   WC26 Fan Zone — Best/Worst Article Styling
   Matches PDF readability and spacing
------------------------------------------ */

.bestof-article {
  font-family: "Inter", system-ui, sans-serif;
  color: #1a1a1a;
  line-height: 1.75;
  max-width: 740px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.bestof-article h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #0C4A6E;
  margin-bottom: 1.25rem;
  line-height: 1.2;
}

.bestof-article h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: #111827;
}

.bestof-article p {
  margin-bottom: 1rem;
  font-size: 1.05rem;
  color: #374151;
}

.bestof-article ul {
  margin: 1rem 0 1.5rem 1.25rem;
  padding-left: 1rem;
  list-style-type: disc;
}

.bestof-article li {
  margin-bottom: 0.6rem;
  font-size: 1.05rem;
  color: #2d2d2d;
}

/* --- Accent Blocks --- */

.bestof-section {
  border-radius: 12px;
  padding: 1.5rem 1.75rem;
  margin: 2rem 0;
  border: 1px solid #e5e7eb;
}

.bestof-section--best {
  background-color: #ecfdf5; /* green tint */
  border-left: 5px solid #059669;
}

.bestof-section--worst {
  background-color: #fef2f2; /* red tint */
  border-left: 5px solid #dc2626;
}

/* Label badges */
.bestof-label {
  display: inline-block;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  background: #f3f4f6;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
}

.bestof-section--best .bestof-label {
  background: #d1fae5;
  color: #065f46;
}

.bestof-section--worst .bestof-label {
  background: #fee2e2;
  color: #991b1b;
}

/* --- Links & CTA inside article --- */
.bestof-article a {
  color: #0C4A6E;
  text-decoration: underline;
  font-weight: 500;
}
.bestof-article a:hover {
  color: #075985;
}

/* --- Intro paragraph emphasis --- */
.bestof-article p:first-of-type {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 1.25rem;
}

/* --- Responsive tweaks --- */
@media (min-width: 1024px) {
  .bestof-article h1 {
    font-size: 2.25rem;
  }
  .bestof-article h2 {
    font-size: 1.75rem;
  }

  
}

import "@/styles/best_of_styles.css";

export default function CityBestPage() {
  ...
  return (
    <main className="bestof-article">
      <section className="bestof-section bestof-section--best">
        <div className="bestof-label">Fan Favorites</div>
        <h2>The Best Of: Dallas World Cup 2026</h2>
        ...
      </section>

      <section className="bestof-section bestof-section--worst">
        <div className="bestof-label">Heads Up</div>
        <h2>The Worst Of: Fan Challenges</h2>
        ...
      </section>
    </main>
  );
}