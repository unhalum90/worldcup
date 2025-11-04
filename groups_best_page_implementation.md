# groups_best Dynamic Page Implementation

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
  const html = marked.parse(content);
  const city = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <article
        className="prose prose-lg mx-auto text-gray-800"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* --- CTA Section --- */}
      <section className="mt-12 border-t border-gray-200 pt-10">
        <h3 className="text-2xl font-semibold text-center mb-6">
          Continue Your World Cup Journey
        </h3>

        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <Link
            href={`/store/${params.slug}`}
            className="inline-block bg-[#0C4A6E] text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-[#075985] transition-colors"
          >
            📘 Download the {city} 9-Page Guide
          </Link>

          <Link
            href={`/trip-builder?city=${params.slug}`}
            className="inline-block bg-[#047857] text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-[#065f46] transition-colors"
          >
            ✈️ Plan Your Trip with the AI Trip Builder
          </Link>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Explore all host cities in our{" "}
          <Link href="/groups" className="text-blue-600 underline">
            Group Stage Analysis
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
```
