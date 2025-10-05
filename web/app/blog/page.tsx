"use client";

import { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
  preview: string;
  substackUrl: string;
  publishDate: string;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("blogPosts");
    if (saved) {
      setPosts(JSON.parse(saved));
    }
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="container py-8 sm:py-12">
      <header className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          Progress Blog
        </h1>
        <p className="text-lg text-[color:var(--color-neutral-700)] max-w-2xl">
          Follow our journey building the ultimate 2026 World Cup fan experience
        </p>
      </header>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? "No posts found matching your search." : "No blog posts yet. Check back soon!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="mb-3">
                  <time className="text-sm text-gray-500">
                    {new Date(post.publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                
                <h2 className="text-xl font-bold mb-3 group-hover:text-[color:var(--color-accent-red)] transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.preview}
                </p>
                
                <a
                  href={post.substackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[color:var(--color-accent-red)] font-semibold hover:underline"
                >
                  Read on Substack
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
